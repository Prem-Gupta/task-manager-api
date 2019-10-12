const sgMail = require('@sendgrid/mail')


sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email,name)  => {
    try{
        sgMail.send({

            to :'priyamgpt444@gmail.com',
            from:'priyamgpt444@gmail.com',
            subject:'Thanks for joining us',
            text:`Welcome to my company, ${name}.`
        })
    }catch(e){
      console.log(e)
    }
  
}

const sendCancellationEmail = (email,name) => {
    try{
        sgMail.send({

            to :'priyamgpt444@gmail.com',
            from:'priyamgpt444@gmail.com',
            subject:'Sorry to see you go !',
            text:`Good Bye ${name}. I hope to see u again`
        })
    }catch(e){
      console.log(e)
    }
}

module.exports = {
    sendWelcomeEmail,sendCancellationEmail
}

