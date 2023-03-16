const passwordValidator = require("password-validator");

const passwordSchema = new passwordValidator();

passwordSchema
.is().min(8)
.is().max(30)
.has().uppercase()
.has().lowercase()
.has().digits(1)
.has().not().spaces()
.is().not().oneOf(["Passw0rd", "Password123"]);

module.exports = (req, res, next) => {
    if(passwordSchema.validate(req.body.password)) {

        next();
    } else {
        res
        .status(400)
        .json({error: `Le mot de passe n'est pas assez fort, vérifiez que vous avez au moins: une majuscule, un chiffre, un symbole et une minuscule. La longueur doit être supérieur à 7 et inférieur à 30 `});
    }
}