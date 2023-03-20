const passwordValidator = require("password-validator");

const passwordSchema = new passwordValidator();


//schema password
passwordSchema
.is().min(6)
.is().max(12)
.has().uppercase()
.has().lowercase()
.has().digits(1)
.has().not().spaces()
.is().not().oneOf(["Passw0rd", "Password!"]);

//vérification schéma password
module.exports = (req, res, next) => {
    if(passwordSchema.validate(req.body.password)) {

        next();
    } else {
        res
        .status(400)
        .json({error: `L'utilisateur existe dejà ou le mot de passe ne correspond pas au schema : une majuscule, un chiffre, un symbole, une minuscule et comprendre entre 6 et 12 caractères `});
    }
}