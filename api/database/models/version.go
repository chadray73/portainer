package models

type Version struct {
	SchemaVersion string `json:"SchemaVersion"`
	BuildVersion  int    `json:"BuildVersion"`
	Edition       int    `json:"Edition"`
	InstanceID    string `json:"InstanceID"`
}
