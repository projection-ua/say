import React, { useState } from "react";
import { Formik, Field, Form } from "formik";
import { Link } from "react-router-dom";
import s from "./ReviewPopup.module.css";
import { apiUrlWp, consumerKey, consumerSecret } from "../../App";
import { FaStar } from "react-icons/fa";
import {useTranslation} from "react-i18next";

interface StarRatingProps {
  value: number;
  onChange: (value: number) => void;
}

export const StarRating: React.FC<StarRatingProps> = ({ value, onChange }) => {
  return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
            <FaStar
                key={star}
                onClick={() => onChange(star)}
                className={`cursor-pointer w-6 h-6 ${
                    value >= star ? "text-yellow-400" : "text-gray-300"
                }`}
            />
        ))}
      </div>
  );
};

interface ReviewFormValues {
  product_id: number;
  name: string;
  phone: string;
  review: string;
  review_images: File[];
  rating: number;
}

interface CartPopupProps {
  onClose: () => void;
  product_id: number;
}

export const ReviewPopup: React.FC<CartPopupProps> = ({ onClose, product_id }) => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [charCount, setCharCount] = useState(0);

  const { t } = useTranslation();

  const initialValues: ReviewFormValues = {
    product_id,
    name: "",
    phone: "",
    review: "",
    review_images: [],
    rating: 0,
  };

  const handleSubmit = async (values: ReviewFormValues) => {
    try {
      const formData = new FormData();

      formData.append("product_id", values.product_id.toString());
      formData.append("name", values.name);
      formData.append("phone", values.phone);
      formData.append("review", values.review);
      formData.append("rating", values.rating.toString());

      values.review_images.forEach((file) => {
        formData.append("media[]", file);
      });

      const credentials = btoa(`${consumerKey}:${consumerSecret}`);
      const url = `${apiUrlWp}wp-json/responses/v1/add-review`;

      console.log("🔍 Відправляємо запит на:", url);
      console.log("📦 FormData payload:", formData);

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Basic ${credentials}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Помилка відповіді:", errorText);
        throw new Error("Помилка при відправленні відгуку");
      }

      const result = await response.json();
      console.log("✅ Успішна відповідь:", result);
      setIsSubmitted(true);
      setError(null);
    } catch (err: any) {
      console.error("❌ Виняток:", err);
      setError(err.message || "Щось пішло не так");
    }
  };



  const handleChange = (
      e: React.ChangeEvent<HTMLTextAreaElement>,
      setFieldValue: (field: string, value: unknown) => void
  ) => {
    const { value } = e.target;
    setCharCount(value.length);
    setFieldValue("review", value);
  };

  const handleFileChange = (
      e: React.ChangeEvent<HTMLInputElement>,
      setFieldValue: (field: string, value: unknown) => void,
      values: ReviewFormValues
  ) => {
    const files = Array.from(e.target.files ?? []);
    setFieldValue("review_images", [...values.review_images, ...files]);
  };

  const handleRemoveImage = (
      index: number,
      setFieldValue: (field: string, value: unknown) => void,
      values: ReviewFormValues
  ) => {
    const updatedImages = values.review_images.filter((_, i) => i !== index);
    setFieldValue("review_images", updatedImages);
  };

  return (
      <div className={s.popupOverlay} onClick={onClose}>
        <div className={s.popupContent} onClick={(e) => e.stopPropagation()}>
          <div className={s.popupHeader}>
            <h2 className={s.popupTitle}>{isSubmitted ? "" : t('review.leaveReview')}</h2>
            <button className={s.closeButton} onClick={onClose}>
              <svg viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M39 13L13 39M13 13L39 39" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          {!isSubmitted ? (
              <Formik initialValues={initialValues} onSubmit={handleSubmit}>
                {({ setFieldValue, values }) => (
                    <Form className={s.form}>
                      <div className={s.wrapInput}>
                        <Field id="name" name="name" placeholder={t('review.yourName')} />
                      </div>

                      <div className={s.wrapInput}>
                        <Field id="phone" name="phone" type="tel" placeholder={t('review.yourPhone')} />
                      </div>

                      <div className={s.wrapInput}>
                        <label htmlFor="review">{t('review.yourComment')}</label>
                        <Field
                            as="textarea"
                            id="review"
                            name="review"
                            placeholder={t('review.commentPlaceholder')}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleChange(e, setFieldValue)}
                            value={values.review}
                        />
                        <div className={s.length}>{charCount}/150</div>
                      </div>

                      <div className={s.reviewAttributes}>

                        <div className={s.imageWrap}>
                          {values.review_images.map((file, index) => (
                              <div key={index} className={s.relative}>
                                <img src={URL.createObjectURL(file)} alt="uploaded" className="w-16 h-16 object-cover" />
                                <button
                                    type="button"
                                    onClick={() => handleRemoveImage(index, setFieldValue, values)}
                                    className={s.delateImage}
                                >
                                  ✕
                                </button>
                              </div>
                          ))}
                        </div>
                        <input
                            type="file"
                            id="file-upload"
                            multiple
                            onChange={(e) => handleFileChange(e, setFieldValue, values)}
                            className={s.dn}
                        />
                        <div className={s.wrapStarImage}>
                          <label htmlFor="file-upload" className={s.customFileUpload}>
                            {t('review.attachPhoto')}
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                              <path d="M5.61646 18.2917C4.66862 18.292 3.74199 18.0111 2.95384 17.4846C2.16568 16.9581 1.55141 16.2096 1.18875 15.3339C0.826101 14.4581 0.731362 13.4945 0.916525 12.565C1.10169 11.6354 1.55843 10.7816 2.22896 10.1117L9.29979 3.04002C9.41704 2.92277 9.57606 2.8569 9.74188 2.8569C9.90769 2.8569 10.0667 2.92277 10.184 3.04002C10.3012 3.15727 10.3671 3.31629 10.3671 3.4821C10.3671 3.64791 10.3012 3.80694 10.184 3.92418L3.11229 10.995C2.76993 11.3208 2.49624 11.7118 2.30735 12.1451C2.11845 12.5783 2.01817 13.0449 2.01242 13.5175C2.00666 13.9901 2.09554 14.459 2.27383 14.8967C2.45212 15.3344 2.7162 15.732 3.05053 16.066C3.38485 16.4 3.78265 16.6638 4.22048 16.8417C4.65832 17.0196 5.12734 17.1081 5.5999 17.102C6.07247 17.0958 6.53903 16.9952 6.97209 16.8059C7.40514 16.6167 7.79594 16.3426 8.12146 16L17.2548 6.86668C17.6733 6.43449 17.9052 5.85509 17.9004 5.25347C17.8955 4.65186 17.6544 4.07626 17.229 3.65084C16.8036 3.22542 16.228 2.98428 15.6263 2.97945C15.0247 2.97462 14.4453 3.20648 14.0131 3.62502L6.64813 10.995C6.55139 11.0918 6.47465 11.2066 6.42229 11.333C6.36994 11.4594 6.34299 11.5949 6.34299 11.7317C6.34299 11.8685 6.36994 12.004 6.42229 12.1304C6.47465 12.2568 6.55139 12.3716 6.64813 12.4684C6.74487 12.5651 6.85971 12.6418 6.98611 12.6942C7.11251 12.7465 7.24798 12.7735 7.38479 12.7735C7.52161 12.7735 7.65708 12.7465 7.78347 12.6942C7.90987 12.6418 8.02472 12.5651 8.12146 12.4684L12.834 7.75502C12.8916 7.6953 12.9605 7.64765 13.0368 7.61486C13.113 7.58207 13.195 7.56479 13.278 7.56403C13.361 7.56327 13.4433 7.57905 13.5201 7.61043C13.5969 7.64182 13.6667 7.6882 13.7254 7.74685C13.7842 7.80551 13.8306 7.87527 13.8621 7.95206C13.8935 8.02886 13.9094 8.11115 13.9087 8.19414C13.908 8.27713 13.8908 8.35915 13.8581 8.43541C13.8254 8.51168 13.7778 8.58067 13.7181 8.63835L9.00479 13.3525C8.792 13.5654 8.53936 13.7342 8.26131 13.8494C7.98326 13.9647 7.68523 14.024 7.38425 14.024C7.08328 14.0241 6.78524 13.9648 6.50716 13.8497C6.22907 13.7345 5.97639 13.5657 5.76354 13.3529C5.55069 13.1401 5.38184 12.8875 5.26662 12.6095C5.15141 12.3314 5.09209 12.0334 5.09205 11.7324C5.09197 11.1245 5.33337 10.5416 5.76313 10.1117L13.1298 2.75002C13.7939 2.08576 14.6948 1.71254 15.6341 1.71246C16.5734 1.71239 17.4743 2.08545 18.1385 2.7496C18.8028 3.41375 19.176 4.31457 19.1761 5.25389C19.1762 6.19321 18.8031 7.0941 18.139 7.75835L9.00563 16.8884C8.56152 17.3347 8.03332 17.6885 7.45157 17.9294C6.86983 18.1703 6.2461 18.2934 5.61646 18.2917Z" fill="#0C1618"/>
                            </svg>
                          </label>

                          <div className="mb-[1vw]">
                            <StarRating value={values.rating} onChange={(val) => setFieldValue("rating", val)} />
                          </div>
                        </div>
                      </div>

                      <div>
                        <button type="submit" className={s.submitButton}>
                          {t('review.sendReview')}
                        </button>
                        {error && <div className="text-red-500">{error}</div>}
                      </div>
                    </Form>
                )}
              </Formik>
          ) : (
              <div className={s.thanksContent}>
                <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g clip-path="url(#clip0_2561_21267)">
                    <rect width="100" height="100" fill="#003C3A"/>
                    <path d="M25 27L27 29L31.5 24.5M27.9932 21.1358C25.9938 18.7984 22.6597 18.1696 20.1547 20.31C17.6496 22.4504 17.297 26.029 19.2642 28.5604C20.7501 30.4724 24.9713 34.311 26.948 36.0749C27.3114 36.3991 27.4931 36.5613 27.7058 36.6251C27.8905 36.6805 28.0958 36.6805 28.2805 36.6251C28.4932 36.5613 28.6749 36.3991 29.0383 36.0749C31.015 34.311 35.2362 30.4724 36.7221 28.5604C38.6893 26.029 38.3797 22.4279 35.8316 20.31C33.2835 18.1922 29.9925 18.7984 27.9932 21.1358Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </g>
                  <defs>
                    <clipPath id="clip0_2561_21267">
                      <rect width="56" height="56" rx="6" fill="white"/>
                    </clipPath>
                  </defs>
                </svg>

                <p>{t('review.thankYou')}</p>
                <h3>{t('review.success')}</h3>
                <Link onClick={onClose} to="/">
                  {t('review.backHome')}
                </Link>
              </div>
          )}
        </div>
      </div>
  );
};
