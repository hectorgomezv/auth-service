import sendgridMail from '@sendgrid/mail';
import logger from '../../infrastructure/logger/pino.js';
import buildRegistrationTemplate from './email-templates/registration-template.js';
import buildResetPasswordTemplate from './email-templates/reset-password-template.js';
import EmailError from './errors/email-error.js';

const { SENDGRID_API_KEY, BASE_EMAIL } = process.env;

sendgridMail.setApiKey(SENDGRID_API_KEY);

export default class EmailRepository {
  /**
   * Sends an email for user registration with a link to activate the account.
   * @param {String} email target user email.
   * @returns {Promise} resolved to true if the email was sent.
   * @throws EmailError if the email could not be sent.
   */
  static async sendRegistration(address, activationCode) {
    try {
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
      await sendgridMail.send(msg);
    } catch (err) {
      logger.error(err);
      throw new EmailError(
        'Error sending registration email.',
        `address:${address}`,
        null,
        err.message,
      );
    }
  }

  /**
   * Sends an email for a user who forgot its password. Includes a resetPasswordCode.
   * @param {String} email target user email.
   * @returns {Promise} resolved to true if the email was sent.
   * @throws EmailError if the email could not be sent.
   */
  static async sendResetPassword(address, resetPasswordCode) {
    try {
      const msg = {
        to: address,
        from: {
          email: BASE_EMAIL,
          name: 'Auth Service Email',
        },
        subject: 'Reset your password',
        text: 'Please click in the link below to reset your password',
        html: buildResetPasswordTemplate({ resetPasswordCode }),
      };
      await sendgridMail.send(msg);
    } catch (err) {
      logger.error(err);
      throw new EmailError(
        'Error sending reset password email.',
        `address:${address}`,
        null,
        err.message,
      );
    }
  }
}
