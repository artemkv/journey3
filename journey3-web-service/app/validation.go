package app

func isUserIdValid(userId string) bool {
	return userId != ""
}

func isEmailValid(email string) bool {
	// TODO: check email format
	return email != ""
}

func isAppIdValid(appId string) bool {
	// TODO: here we could validate the format
	return true
}

func isAppNameValid(appName string) bool {
	return len(appName) <= 100
}

func isPeriodValid(period string) bool {
	if period == "year" {
		return true
	}
	if period == "month" {
		return true
	}
	if period == "day" {
		return true
	}
	return false
}

func isRetentionPeriodValid(period string) bool {
	return period == "day"
}

func isDtValid(period string, dt string) bool {
	if period == "year" {
		return len(dt) == 4 // TODO: could think about more rigorous validation
	}
	if period == "month" {
		return len(dt) == 6
	}
	if period == "day" {
		return len(dt) == 8
	}
	return false
}

func isBuildValid(build string) bool {
	if build == "Release" {
		return true
	}
	if build == "Debug" {
		return true
	}
	return false
}
