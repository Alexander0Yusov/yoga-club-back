export const emailTemplates = {
  registrationEmail(code: string, lang: string) {
    return ` <h1>Thank for your registration</h1>
               <p>To finish registration please follow the link below:<br>
                  <a href='http://localhost:3000/${lang}/auth/registration-confirmation?code=${code}'>complete registration</a>
               </p>`;
  },

  passwordRecoveryEmail(code: string, lang: string) {
    return `<h1>Password recovery</h1>
        <p>To finish password recovery please follow the link below:
            <a href='http://localhost:3000/${lang}/auth/password-recovery?recoveryCode=${code}'>recovery password</a>
        </p>`;
  },
};
