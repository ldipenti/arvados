// Copyright (C) The Arvados Authors. All rights reserved.
//
// SPDX-License-Identifier: AGPL-3.0

package main

import (
	"bytes"
	"crypto/rand"
	"fmt"
	"io/ioutil"
	"os"
	"strings"
	"sync"
	"time"

	"git.arvados.org/arvados.git/sdk/go/arvados"
	"git.arvados.org/arvados.git/sdk/go/arvadosclient"
	"git.arvados.org/arvados.git/sdk/go/arvadostest"
	"git.arvados.org/arvados.git/sdk/go/keepclient"
	"github.com/AdRoll/goamz/aws"
	"github.com/AdRoll/goamz/s3"
	check "gopkg.in/check.v1"
)

type s3stage struct {
	arv        *arvados.Client
	ac         *arvadosclient.ArvadosClient
	kc         *keepclient.KeepClient
	proj       arvados.Group
	projbucket *s3.Bucket
	coll       arvados.Collection
	collbucket *s3.Bucket
}

func (s *IntegrationSuite) s3setup(c *check.C) s3stage {
	var proj arvados.Group
	var coll arvados.Collection
	arv := arvados.NewClientFromEnv()
	arv.AuthToken = arvadostest.ActiveToken
	err := arv.RequestAndDecode(&proj, "POST", "arvados/v1/groups", nil, map[string]interface{}{
		"group": map[string]interface{}{
			"group_class": "project",
			"name":        "keep-web s3 test",
		},
		"ensure_unique_name": true,
	})
	c.Assert(err, check.IsNil)
	err = arv.RequestAndDecode(&coll, "POST", "arvados/v1/collections", nil, map[string]interface{}{"collection": map[string]interface{}{
		"owner_uuid":    proj.UUID,
		"name":          "keep-web s3 test collection",
		"manifest_text": ". d41d8cd98f00b204e9800998ecf8427e+0 0:0:emptyfile\n./emptydir d41d8cd98f00b204e9800998ecf8427e+0 0:0:.\n",
	}})
	c.Assert(err, check.IsNil)
	ac, err := arvadosclient.New(arv)
	c.Assert(err, check.IsNil)
	kc, err := keepclient.MakeKeepClient(ac)
	c.Assert(err, check.IsNil)
	fs, err := coll.FileSystem(arv, kc)
	c.Assert(err, check.IsNil)
	f, err := fs.OpenFile("sailboat.txt", os.O_CREATE|os.O_WRONLY, 0644)
	c.Assert(err, check.IsNil)
	_, err = f.Write([]byte("⛵\n"))
	c.Assert(err, check.IsNil)
	err = f.Close()
	c.Assert(err, check.IsNil)
	err = fs.Sync()
	c.Assert(err, check.IsNil)
	err = arv.RequestAndDecode(&coll, "GET", "arvados/v1/collections/"+coll.UUID, nil, nil)
	c.Assert(err, check.IsNil)

	auth := aws.NewAuth(arvadostest.ActiveTokenV2, arvadostest.ActiveTokenV2, "", time.Now().Add(time.Hour))
	region := aws.Region{
		Name:       s.testServer.Addr,
		S3Endpoint: "http://" + s.testServer.Addr,
	}
	client := s3.New(*auth, region)
	return s3stage{
		arv:  arv,
		ac:   ac,
		kc:   kc,
		proj: proj,
		projbucket: &s3.Bucket{
			S3:   client,
			Name: proj.UUID,
		},
		coll: coll,
		collbucket: &s3.Bucket{
			S3:   client,
			Name: coll.UUID,
		},
	}
}

func (stage s3stage) teardown(c *check.C) {
	if stage.coll.UUID != "" {
		err := stage.arv.RequestAndDecode(&stage.coll, "DELETE", "arvados/v1/collections/"+stage.coll.UUID, nil, nil)
		c.Check(err, check.IsNil)
	}
}

func (s *IntegrationSuite) TestS3CollectionGetObject(c *check.C) {
	stage := s.s3setup(c)
	defer stage.teardown(c)
	s.testS3GetObject(c, stage.collbucket, "")
}
func (s *IntegrationSuite) TestS3ProjectGetObject(c *check.C) {
	stage := s.s3setup(c)
	defer stage.teardown(c)
	s.testS3GetObject(c, stage.projbucket, stage.coll.Name+"/")
}
func (s *IntegrationSuite) testS3GetObject(c *check.C, bucket *s3.Bucket, prefix string) {
	rdr, err := bucket.GetReader(prefix + "emptyfile")
	c.Assert(err, check.IsNil)
	buf, err := ioutil.ReadAll(rdr)
	c.Check(err, check.IsNil)
	c.Check(len(buf), check.Equals, 0)
	err = rdr.Close()
	c.Check(err, check.IsNil)

	rdr, err = bucket.GetReader(prefix + "missingfile")
	c.Check(err, check.ErrorMatches, `404 Not Found`)

	rdr, err = bucket.GetReader(prefix + "sailboat.txt")
	c.Assert(err, check.IsNil)
	buf, err = ioutil.ReadAll(rdr)
	c.Check(err, check.IsNil)
	c.Check(buf, check.DeepEquals, []byte("⛵\n"))
	err = rdr.Close()
	c.Check(err, check.IsNil)
}

func (s *IntegrationSuite) TestS3CollectionPutObjectSuccess(c *check.C) {
	stage := s.s3setup(c)
	defer stage.teardown(c)
	s.testS3PutObjectSuccess(c, stage.collbucket, "")
}
func (s *IntegrationSuite) TestS3ProjectPutObjectSuccess(c *check.C) {
	stage := s.s3setup(c)
	defer stage.teardown(c)
	s.testS3PutObjectSuccess(c, stage.projbucket, stage.coll.Name+"/")
}
func (s *IntegrationSuite) testS3PutObjectSuccess(c *check.C, bucket *s3.Bucket, prefix string) {
	for _, trial := range []struct {
		path string
		size int
	}{
		{
			path: "newfile",
			size: 128000000,
		}, {
			path: "newdir/newfile",
			size: 1 << 26,
		}, {
			path: "newdir1/newdir2/newfile",
			size: 0,
		},
	} {
		c.Logf("=== %v", trial)

		objname := prefix + trial.path

		_, err := bucket.GetReader(objname)
		c.Assert(err, check.ErrorMatches, `404 Not Found`)

		buf := make([]byte, trial.size)
		rand.Read(buf)

		err = bucket.PutReader(objname, bytes.NewReader(buf), int64(len(buf)), "application/octet-stream", s3.Private, s3.Options{})
		c.Check(err, check.IsNil)

		rdr, err := bucket.GetReader(objname)
		if !c.Check(err, check.IsNil) {
			continue
		}
		buf2, err := ioutil.ReadAll(rdr)
		c.Check(err, check.IsNil)
		c.Check(buf2, check.HasLen, len(buf))
		c.Check(bytes.Equal(buf, buf2), check.Equals, true)
	}
}

func (s *IntegrationSuite) TestS3CollectionPutObjectFailure(c *check.C) {
	stage := s.s3setup(c)
	defer stage.teardown(c)
	s.testS3PutObjectFailure(c, stage.collbucket, "")
}
func (s *IntegrationSuite) TestS3ProjectPutObjectFailure(c *check.C) {
	stage := s.s3setup(c)
	defer stage.teardown(c)
	s.testS3PutObjectFailure(c, stage.projbucket, stage.coll.Name+"/")
}
func (s *IntegrationSuite) testS3PutObjectFailure(c *check.C, bucket *s3.Bucket, prefix string) {
	var wg sync.WaitGroup
	for _, trial := range []struct {
		path string
	}{
		{
			path: "emptyfile/newname", // emptyfile exists, see s3setup()
		}, {
			path: "emptyfile/", // emptyfile exists, see s3setup()
		}, {
			path: "emptydir", // dir already exists, see s3setup()
		}, {
			path: "emptydir/",
		}, {
			path: "emptydir//",
		}, {
			path: "newdir/",
		}, {
			path: "newdir//",
		}, {
			path: "/",
		}, {
			path: "//",
		}, {
			path: "foo//bar",
		}, {
			path: "",
		},
	} {
		trial := trial
		wg.Add(1)
		go func() {
			defer wg.Done()
			c.Logf("=== %v", trial)

			objname := prefix + trial.path

			buf := make([]byte, 1234)
			rand.Read(buf)

			err := bucket.PutReader(objname, bytes.NewReader(buf), int64(len(buf)), "application/octet-stream", s3.Private, s3.Options{})
			if !c.Check(err, check.ErrorMatches, `400 Bad.*`, check.Commentf("PUT %q should fail", objname)) {
				return
			}

			if objname != "" && objname != "/" {
				_, err = bucket.GetReader(objname)
				c.Check(err, check.ErrorMatches, `404 Not Found`, check.Commentf("GET %q should return 404", objname))
			}
		}()
	}
	wg.Wait()
}

func (stage *s3stage) writeBigDirs(c *check.C, dirs int, filesPerDir int) {
	fs, err := stage.coll.FileSystem(stage.arv, stage.kc)
	c.Assert(err, check.IsNil)
	for d := 0; d < dirs; d++ {
		dir := fmt.Sprintf("dir%d", d)
		c.Assert(fs.Mkdir(dir, 0755), check.IsNil)
		for i := 0; i < filesPerDir; i++ {
			f, err := fs.OpenFile(fmt.Sprintf("%s/file%d.txt", dir, i), os.O_CREATE|os.O_WRONLY, 0644)
			c.Assert(err, check.IsNil)
			c.Assert(f.Close(), check.IsNil)
		}
	}
	c.Assert(fs.Sync(), check.IsNil)
}

func (s *IntegrationSuite) TestS3CollectionList(c *check.C) {
	stage := s.s3setup(c)
	defer stage.teardown(c)

	filesPerDir := 1001
	stage.writeBigDirs(c, 2, filesPerDir)
	s.testS3List(c, stage.collbucket, "", 4000, 2+filesPerDir*2)
	s.testS3List(c, stage.collbucket, "", 131, 2+filesPerDir*2)
	s.testS3List(c, stage.collbucket, "dir0/", 71, filesPerDir)
}
func (s *IntegrationSuite) testS3List(c *check.C, bucket *s3.Bucket, prefix string, pageSize, expectFiles int) {
	gotKeys := map[string]s3.Key{}
	nextMarker := ""
	pages := 0
	for {
		resp, err := bucket.List(prefix, "", nextMarker, pageSize)
		if !c.Check(err, check.IsNil) {
			break
		}
		c.Check(len(resp.Contents) <= pageSize, check.Equals, true)
		if pages++; !c.Check(pages <= (expectFiles/pageSize)+1, check.Equals, true) {
			break
		}
		for _, key := range resp.Contents {
			gotKeys[key.Key] = key
		}
		if !resp.IsTruncated {
			c.Check(resp.NextMarker, check.Equals, "")
			break
		}
		if !c.Check(resp.NextMarker, check.Not(check.Equals), "") {
			break
		}
		nextMarker = resp.NextMarker
	}
	c.Check(len(gotKeys), check.Equals, expectFiles)
}

func (s *IntegrationSuite) TestS3CollectionListRollup(c *check.C) {
	stage := s.s3setup(c)
	defer stage.teardown(c)

	dirs := 2
	filesPerDir := 500
	stage.writeBigDirs(c, dirs, filesPerDir)
	err := stage.collbucket.PutReader("dingbats", &bytes.Buffer{}, 0, "application/octet-stream", s3.Private, s3.Options{})
	c.Assert(err, check.IsNil)
	resp, err := stage.collbucket.List("", "", "", 20000)
	c.Check(err, check.IsNil)
	var allfiles []string
	for _, key := range resp.Contents {
		allfiles = append(allfiles, key.Key)
	}
	c.Check(allfiles, check.HasLen, dirs*filesPerDir+3)

	for _, trial := range []struct {
		prefix    string
		delimiter string
		marker    string
	}{
		{"di", "/", ""},
		{"di", "r", ""},
		{"di", "n", ""},
		{"dir0", "/", ""},
		{"dir0", "/", "dir0/file14.txt"},       // no commonprefixes
		{"", "", "dir0/file14.txt"},            // middle page, skip walking dir1
		{"", "", "dir1/file14.txt"},            // middle page, skip walking dir0
		{"", "", "dir1/file498.txt"},           // last page of results
		{"dir1/file", "", "dir1/file498.txt"},  // last page of results, with prefix
		{"dir1/file", "/", "dir1/file498.txt"}, // last page of results, with prefix + delimiter
		{"dir1", "Z", "dir1/file498.txt"},      // delimiter "Z" never appears
		{"dir2", "/", ""},                      // prefix "dir2" does not exist
		{"", "/", ""},
	} {
		c.Logf("\n\n=== trial %+v", trial)

		maxKeys := 20
		resp, err := stage.collbucket.List(trial.prefix, trial.delimiter, trial.marker, maxKeys)
		c.Check(err, check.IsNil)
		if resp.IsTruncated && trial.delimiter == "" {
			// goamz List method fills in the missing
			// NextMarker field if resp.IsTruncated, so
			// now we can't really tell whether it was
			// sent by the server or by goamz. In cases
			// where it should be empty but isn't, assume
			// it's goamz's fault.
			resp.NextMarker = ""
		}

		var expectKeys []string
		var expectPrefixes []string
		var expectNextMarker string
		var expectTruncated bool
		for _, key := range allfiles {
			full := len(expectKeys)+len(expectPrefixes) >= maxKeys
			if !strings.HasPrefix(key, trial.prefix) || key < trial.marker {
				continue
			} else if idx := strings.Index(key[len(trial.prefix):], trial.delimiter); trial.delimiter != "" && idx >= 0 {
				prefix := key[:len(trial.prefix)+idx+1]
				if len(expectPrefixes) > 0 && expectPrefixes[len(expectPrefixes)-1] == prefix {
					// same prefix as previous key
				} else if full {
					expectNextMarker = key
					expectTruncated = true
				} else {
					expectPrefixes = append(expectPrefixes, prefix)
				}
			} else if full {
				if trial.delimiter != "" {
					expectNextMarker = key
				}
				expectTruncated = true
				break
			} else {
				expectKeys = append(expectKeys, key)
			}
		}

		var gotKeys []string
		for _, key := range resp.Contents {
			gotKeys = append(gotKeys, key.Key)
		}
		var gotPrefixes []string
		for _, prefix := range resp.CommonPrefixes {
			gotPrefixes = append(gotPrefixes, prefix)
		}
		c.Check(gotKeys, check.DeepEquals, expectKeys)
		c.Check(gotPrefixes, check.DeepEquals, expectPrefixes)
		c.Check(resp.NextMarker, check.Equals, expectNextMarker)
		c.Check(resp.IsTruncated, check.Equals, expectTruncated)
		c.Logf("=== trial %+v keys %q prefixes %q nextMarker %q", trial, gotKeys, gotPrefixes, resp.NextMarker)
	}
}
