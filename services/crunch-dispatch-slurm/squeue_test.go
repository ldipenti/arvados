// Copyright (C) The Arvados Authors. All rights reserved.
//
// SPDX-License-Identifier: AGPL-3.0

package main

import (
	"time"

	. "gopkg.in/check.v1"
)

var _ = Suite(&SqueueSuite{})

type SqueueSuite struct{}

func (s *SqueueSuite) TestReniceAll(c *C) {
	uuids := []string{"zzzzz-dz642-fake0fake0fake0", "zzzzz-dz642-fake1fake1fake1", "zzzzz-dz642-fake2fake2fake2"}
	for _, test := range []struct {
		spread int64
		squeue string
		want   map[string]int64
		expect [][]string
	}{
		{
			spread: 0,
			squeue: uuids[0] + " 10000 4294000000\n",
			want:   map[string]int64{uuids[0]: 1},
			expect: [][]string{{uuids[0], "0"}},
		},
		{ // fake0 priority is too high
			spread: 0,
			squeue: uuids[0] + " 10000 4294000777\n" + uuids[1] + " 10000 4294000444\n",
			want:   map[string]int64{uuids[0]: 1, uuids[1]: 999},
			expect: [][]string{{uuids[1], "0"}, {uuids[0], "334"}},
		},
		{ // non-zero spread
			spread: 100,
			squeue: uuids[0] + " 10000 4294000777\n" + uuids[1] + " 10000 4294000444\n",
			want:   map[string]int64{uuids[0]: 1, uuids[1]: 999},
			expect: [][]string{{uuids[1], "0"}, {uuids[0], "434"}},
		},
		{ // ignore fake2 because SetPriority() not called
			squeue: uuids[0] + " 10000 4294000000\n" + uuids[1] + " 10000 4294000111\n" + uuids[2] + " 10000 4294000222\n",
			want:   map[string]int64{uuids[0]: 999, uuids[1]: 1},
			expect: [][]string{{uuids[0], "0"}, {uuids[1], "112"}},
		},
	} {
		c.Logf("spread=%d squeue=%q want=%v -> expect=%v", test.spread, test.squeue, test.want, test.expect)
		slurm := &slurmFake{
			queue: test.squeue,
		}
		sqc := &SqueueChecker{
			Slurm:          slurm,
			PrioritySpread: test.spread,
			Period:         time.Hour,
		}
		sqc.startOnce.Do(sqc.start)
		sqc.check()
		for uuid, pri := range test.want {
			sqc.SetPriority(uuid, pri)
		}
		sqc.reniceAll()
		c.Check(slurm.didRenice, DeepEquals, test.expect)
		sqc.Stop()
	}
}

// If the given UUID isn't in the slurm queue yet, SetPriority()
// should wait for it to appear on the very next poll, then give up.
func (s *SqueueSuite) TestSetPriorityBeforeQueued(c *C) {
	uuidGood := "zzzzz-dz642-fake0fake0fake0"
	uuidBad := "zzzzz-dz642-fake1fake1fake1"

	slurm := &slurmFake{}
	sqc := &SqueueChecker{
		Slurm:  slurm,
		Period: time.Hour,
	}
	sqc.startOnce.Do(sqc.start)
	sqc.Stop()
	sqc.check()

	done := make(chan struct{})
	go func() {
		sqc.SetPriority(uuidGood, 123)
		sqc.SetPriority(uuidBad, 345)
		close(done)
	}()
	c.Check(sqc.queue[uuidGood], IsNil)
	c.Check(sqc.queue[uuidBad], IsNil)
	timeout := time.NewTimer(time.Second)
	defer timeout.Stop()
	tick := time.NewTicker(time.Millisecond)
	defer tick.Stop()
	for {
		select {
		case <-tick.C:
			slurm.queue = uuidGood + " 0 12345\n"
			sqc.check()
		case <-timeout.C:
			c.Fatal("timed out")
		case <-done:
			c.Assert(sqc.queue[uuidGood], NotNil)
			c.Check(sqc.queue[uuidGood].wantPriority, Equals, int64(123))
			c.Check(sqc.queue[uuidBad], IsNil)
			return
		}
	}
}
