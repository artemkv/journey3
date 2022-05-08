package app

import (
	"fmt"

	log "github.com/sirupsen/logrus"
)

func getHashKey(keyPrefix string, appId string, build string) string {
	return fmt.Sprintf("%s#%s#%s", keyPrefix, appId, build)
}

func logAndConvertError(err error) error {
	log.Printf("%v", err)
	return fmt.Errorf("service unavailable")
}
