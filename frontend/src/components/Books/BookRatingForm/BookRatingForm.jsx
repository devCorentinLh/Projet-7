import * as PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import styles from './BookRatingForm.module.css';
import { generateStarsInputs, displayStars } from '../../../lib/functions';
import { APP_ROUTES } from '../../../utils/constants';
import { useUser } from '../../../lib/customHooks';
import { rateBook } from '../../../lib/common';

function BookRatingForm({
  rating, setRating, userId, setBook, id, userRated,
}) {
  const { connectedUser, auth } = useUser();
  const navigate = useNavigate();
  const { register, formState, handleSubmit } = useForm({
    mode: 'onChange',
    defaultValues: {
      rating: 0,
    },
  });
  useEffect(() => {
    if (formState.dirtyFields.rating) {
      const rate = document.querySelector('input[name="rating"]:checked').value;
      console.log(rate);
      setRating(parseInt(rate, 10));
      console.log(rating);
      formState.dirtyFields.rating = false;
    }
  }, [formState]);

  const onSubmit = async () => {
    console.log('formulaire envoyé');
    if (!connectedUser || !auth) {
      navigate(APP_ROUTES.SIGN_IN);
    }
    const update = await rateBook(id, userId, rating);
    if (update) {
      console.log(update);
      console.log(id);
      console.log(userId);
      console.log(rating);
      // eslint-disable-next-line no-underscore-dangle
      setBook({ ...update, id: update._id });
    } else {
      console.log(update);
      alert(update);
    }
  };

  return (
    <div className={styles.BookRatingForm}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <p>{!userRated ? 'Notez cet ouvrage' : 'Votre Note'}</p>
        <div className={styles.Stars}>
          {!userRated ? generateStarsInputs(rating, register) : displayStars(rating)}
        </div>
        {!userRated ? <button type="submit">Valider</button> : null}
      </form>
    </div>
  );
}

BookRatingForm.propTypes = {
  rating: PropTypes.number.isRequired,
  setRating: PropTypes.func.isRequired,
  userId: PropTypes.string.isRequired,
  setBook: PropTypes.func.isRequired,
  id: PropTypes.string.isRequired,
  userRated: PropTypes.bool.isRequired,
};

export default BookRatingForm;
