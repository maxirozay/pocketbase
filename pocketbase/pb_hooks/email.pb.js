onMailerRecordOTPSend((e) => {
  // e.app
  // e.mailer
  // e.message
  // e.record
  // e.meta.otpId
  // e.meta.password
  if (e.record.getString("locale")?.startsWith("fr")) {
    e.message.subject = 'Nouveau OTP'
    e.message.html = `Votre nouveau code OTP est : ${e.meta.password}`
  } else {
    e.message.subject = 'New OTP'
    e.message.html = `Your new OTP code is: ${e.meta.password}`
  }

  e.next()
})

onRecordRequestOTPRequest((e) => {
  if (!e.record) {
    const info = e.requestInfo()
    let email = info.body["email"]

    let record = new Record(e.collection)
    record.setEmail(email)
    record.setPassword($security.randomString(30))

    let locale = info.query.locale
    
    locale = locale.substring(0, 2)

    if (locale) {
      record.set("locale", locale)
    }

    e.app.save(record)

    e.record = record
  }

  return e.next()
}, "users")
