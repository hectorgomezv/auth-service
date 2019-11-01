const sendgridMail = require('@sendgrid/mail');
const { buildRegistrationTemplate } = require('./email-templates');

const {
  SENDGRID_API_KEY,
  BASE_EMAIL,
} = process.env;

sendgridMail.setApiKey(SENDGRID_API_KEY);

class EmailRepository {
  /**
   * Sends an email for user registration with a link to activate the account.
   * @param {String} email target user email.
   * @returns {Promise} resolved to true if the email was sent.
   * @throws EmailError if the email could not be sent.
   */
  static async sendRegistration(address, activationCode) {
    const msg = {
      to: address,
      from: {
        email: BASE_EMAIL,
        name: 'Auth Service Email',
      },
      subject: 'New user registration',
      text: 'Hello! Welcome to our platform!',
      html: buildRegistrationTemplate({ activationCode }),
    };

    return sendgridMail.send(msg);
  }
}

module.exports = EmailRepository;
