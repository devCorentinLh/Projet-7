const Book = require("../models/Book");
const fs = require("fs"); //fs = file system



exports.createBook = (req, res, next) => {
  const bookObject = JSON.parse(req.body.book);

  delete bookObject.id;
  delete bookObject.userId;

  const book = new Book({
    ...bookObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
  });
  book
    .save()
    .then(() => res.status(201).json({ message: "Objet enregistré ! " }))
    .catch((error) => res.status(400).json({ error }));
};

exports.modifyBook = (req, res, next) => {
  const bookObject = req.file
    ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      }
    : { ...req.body };
  delete bookObject.userId;

  Book.findOne({ _id: req.params.id })
    .then((book) => {
      console.log(40);
      console.log(bookObject);
      if (book.userId !== req.auth.userId) {
        res
          .status(401)
          .json({ message: "Vous n'êtes pas autorisé à modifier ce livre." });
      } else {
        if (bookObject.imageUrl) {
          const filename = book.imageUrl.split("/images/")[1];
          fs.unlink(`images/${filename}`, () => updateNewBook());
        } else {
          updateNewBook();
        }

        // Ici je met ma fonction finale update dans une autre fonction, car je veux la passer dans 2 cas
        //(voir ci dessus), si je met à jour mon image(bookObject.imageUrl)
        // l'ancienne image sera suprrimé du dossier, autrement je passe juste ma fonction
        function updateNewBook() {
          Book.updateOne(
            { _id: req.params.id },
            { ...bookObject, _id: req.params.id }
          )
            .then(() => {
              res.status(200).json(bookObject);
            })
            .catch((err) => res.status(401).json({ err }));
        }
      }
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

exports.getAllBooks = (req, res, next) => {
  Book.find()
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(400).json({ error: "erreur" }));
};

exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId !== req.auth.userId) {
        res.status(401).json({ message: "Non autorisé" });
      } else {
        const filename = book.imageUrl.split("/images/")[1];

        fs.unlink(`images/${filename}`, () =>
          Book.deleteOne({ _id: req.params.id })
            .then(() => res.status(200).json({ message: "Livre supprimé !" }))
            .catch((err) => res.status(400).json({ err }))
        );
      }
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};

exports.getBestBooks = (req, res, next) => {
  Book.find()
    .then((books) => {
      res
        .status(200)
        .json(
          [...books]
            .sort((a, b) => b.averageRating - a.averageRating)
            .splice(0, 3)
        );
    })
    .catch((err) => res.status(400).json({ err }));
};

exports.getOneBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => res.status(200).json(book))
    .catch((error) => res.status(400).json({ error }));
};

exports.postRating = (req, res, next) => {

  const newRating = { ...req.body };
  newRating.grade = newRating.rating;
  delete newRating.rating;
  //ici j'ajoute la valeur grade, car les datas envoyées par le front ne sont pas celles attendues
  // (rating au lieu de grade)
  // userId: , rating:  à la place de userId: , grade

  Book.findOne({ _id: req.params.id })
    .then((book) => {
      const cloneBook = {...book._doc};
      cloneBook.ratings = [{...newRating}, ...book.ratings];


      //ici on créé la fonction qui return avr(le nouveau averageRating)
      // Le calcul si dessus, prend la some avec reduce qui accumule les elem.grade et le divise par leur length
      // et Math.round * 100 / 100 permet d'arrondir le résultat à 2 chiffres après la virgule
      function calcAverageGrade(arr) {
        let avr = Math.round((arr.reduce((acc, elem) => acc + elem.grade, 0) / arr.length) * 100) / 100;
        return avr;
      };
      cloneBook.averageRating = calcAverageGrade(cloneBook.ratings);

      Book.updateOne(
        { _id: req.params.id },
        {...cloneBook}
        )
        .then(() => {
          console.log("updateOne appelé");
          res.status(200).json(cloneBook);
        })
        .catch((err) => {
          console.log("erreur 401");
          res.status(401).json({err});
        });
    })
    .catch((error) => {
      console.log("erreur 400");
      res.status(400).json({ error });
    });
};
