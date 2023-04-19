const Book = require("../models/Book");
const fs = require("fs");

exports.createBook = (req, res, next) => {
  const bookObject = JSON.parse(req.body.book);
  delete bookObject.userId;
  const book = new Book({
    ...bookObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
    averageRating: bookObject.ratings[0].grade
  });
  book
    .save()
    .then(() => res.status(201).json({ message: "Livre enregistré ! " }))
    .catch((error) => res.status(400).json({ error: bookObject }));
// ajout d'une fonction resize pour redimensionner les images
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
      // vérification que userId du livre est égal à celui connecté.
      if (book.userId !== req.auth.userId) {
        res
          .status(401)
          .json({ message:"Vous n'êtes pas le créateur de ce livre." });
      } else {
        if (bookObject.imageUrl) {
          const filename = book.imageUrl.split("/images/")[1];
          fs.unlink(`images/${filename}`, () => updateNewBook());
        } else {
          updateNewBook();
        }
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
            .sort((a, b) => b.averageRating - a.averageRating) // tri décroissant avec sort
            .splice(0, 3) //remonte les 3 premiers livres
        );
    })
    .catch((err) => res.status(400).json({ err }));
};
exports.getOneBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
  .then((book) => {
    //ajout de la vérification de l'userId et du rating du user connecté
    // const userId = req.auth.userId;
    // const userRating = book.ratings.find((rating) => rating.userId === userId);
    const imageUrl = `${req.protocol}://${req.get("host")}/images/${book.imageUrl.split("/images/")[1]}`;
  res.status(200).json({...book._doc, imageUrl});
  })
  .catch((error) => {
  res.status(400).json({ error });
  });
  };

  exports.postRating = (req, res, next) => {
    const newRating = { ...req.body };
    newRating.grade = newRating.rating;
    delete newRating.rating;
    Book.findOne({ _id: req.params.id })
      .then((book) => {
        const cloneBook = { ...book._doc };
        cloneBook.ratings.push(newRating); // Ajouter la nouvelle note à la fin du tableau
        function calcAverageGrade(arr) {
          let avr = Math.round((arr.reduce((acc, elem) => acc + elem.grade, 0) / arr.length) * 100) / 100;
          return avr;
        };
        cloneBook.averageRating = calcAverageGrade(cloneBook.ratings);
        Book.updateOne(
          { _id: req.params.id },
          { ...cloneBook }
        )
          .then(() => {
            res.status(200).json(cloneBook);
          })
          .catch((err) => {
            res.status(401).json({ err });
          });
      })
      .catch((error) => {
        res.status(400).json({ error });
      });
  };
