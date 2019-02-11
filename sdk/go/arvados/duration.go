// Copyright (C) The Arvados Authors. All rights reserved.
//
// SPDX-License-Identifier: Apache-2.0

package arvados

import (
	"encoding/json"
	"fmt"
	"reflect"
	"time"
)

// Duration is time.Duration but looks like "12s" in JSON, rather than
// a number of nanoseconds.
type Duration time.Duration

// UnmarshalJSON implements json.Unmarshaler
func (d *Duration) UnmarshalJSON(data []byte) error {
	if data[0] == '"' {
		return d.Set(string(data[1 : len(data)-1]))
	}
	return fmt.Errorf("duration must be given as a string like \"600s\" or \"1h30m\"")
}

// MarshalJSON implements json.Marshaler
func (d *Duration) MarshalJSON() ([]byte, error) {
	return json.Marshal(d.String())
}

// String implements fmt.Stringer
func (d Duration) String() string {
	return time.Duration(d).String()
}

// Duration returns a time.Duration
func (d Duration) Duration() time.Duration {
	return time.Duration(d)
}

// Set sets the current duration by parsing the string using time.ParseDuration
func (d *Duration) Set(s string) error {
	dur, err := time.ParseDuration(s)
	*d = Duration(dur)
	return err
}

// DurationMapStructureDecodeHook can be used to create a decoder for arvados.duration when using mapstructure
func DurationMapStructureDecodeHook() interface{} {
	return func(f reflect.Type, t reflect.Type, data interface{}) (interface{}, error) {
		var duration Duration
		if f.Kind() != reflect.String || t != reflect.TypeOf(duration) {
			return data, nil
		}

		duration.Set(data.(string))
		return duration, nil
	}
}
