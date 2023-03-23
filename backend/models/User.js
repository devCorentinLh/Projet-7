const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const userSchema = mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function(v) {
        return /\S+@\S+\.\S{2,}/.test(v);
      },
      message: props => `${props.value} n'est pas une adresse email valide!`
           + '  Votre adresse email doit respecter la forme "adresse@domaine.com". Veuillez réessayer avec une adresse email valide.'
          }
  },
  password: { type: String, required: true },
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model("User", userSchema)
