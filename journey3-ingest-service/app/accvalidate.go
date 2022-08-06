package app

import (
	"time"

	log "github.com/sirupsen/logrus"
)

var accounts map[string]bool
var expires = time.Time{}
var ACCOUNT_REFRESH_INTERVAL = time.Duration(5) * time.Minute

func IsValidAccount(accId string) bool {
	err := reloadAccountsIfNecessary()
	if err != nil {
		log.Debugf("Invalid account %s", accId)
		return false
	}

	_, ok := accounts[accId]
	return ok
}

func reloadAccountsIfNecessary() error {
	now := time.Now().UTC()
	if now.Before(expires) {
		return nil
	}

	log.Debug("Syncing accounts")

	accountList, err := getAccounts()
	if err != nil {
		return err
	}

	accounts = make(map[string]bool, len(accountList))
	for _, v := range accountList {
		accounts[v] = true
	}

	expires = time.Now().Add(ACCOUNT_REFRESH_INTERVAL).UTC()

	log.Debug("Syncing accounts done")

	return nil
}
