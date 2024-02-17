import React, { useCallback, useEffect, useState } from 'react';
import {
  attachCustomer,
  createOrder,
  getAllDataOfServiceItem,
  getCustomer,
  createPaymentIntent,
} from '../../services';
import { useNavigate, useParams } from 'react-router-dom';
import { AllDataOfServiceItemData, AllDataOfServiceItemResult } from '../../types/serviceItem.tpes';
import { Loader } from '../../components/Loader';
import styled from '@emotion/styled';
import { useStripe, CardElement, useElements } from '@stripe/react-stripe-js';
import styles from './service.module.scss';
import BackArrow from '../../assets/svg/BackArrow';
import { Button } from '../../components/Button';
import { QuestionType } from '../../enum';
import { Map } from '../../components/Map';
import { toast } from 'react-toastify';
import { RouteMap } from '../../components/RouteMap';
import {
  IAttachCustomerPayload,
  IGetCustomerPayload,
  IPaymentPayload,
} from '../../types/stripe.types';
import { StripeCardElementOptions } from '@stripe/stripe-js';
const AWS_ACCESS_URL = import.meta.env.VITE_REACT_APP_AWS_ACCESS_URL;

const CardElementContainer = styled.div`
  height: 40px;
  display: flex;
  align-items: center;

  & .StripeElement {
    width: 100%;
    padding: 15px;
  }
`;

const Service: React.FC = () => {
  const { serviceItemId } = useParams();
  const [step, setStep] = useState<number>(0);
  const [address, setAddress] = useState<string>('');
  const [origin, setOrigin] = useState<string>('');
  const [destination, setDestination] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const [distance, setDistance] = useState<number>(0);
  const [serviceItemData, setServiceItemData] = useState<AllDataOfServiceItemData[]>([]);
  const [orderDetails, setOrderDetails] = useState<any>({});
  const [checkoutError, setCheckoutError] = useState<any>();
  const [isProcessing, setProcessingTo] = useState<boolean>(false);
  const [timerOn, setTimerOn] = useState(false);
  const [clicking, setClicking] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState(240);
  const stripe = useStripe();
  const elements = useElements();

  let total = 0;

  useEffect(() => {
    if (step === 0 && serviceItemId) {
      setOrderDetails((prevOrderDetails: any) => ({
        ...prevOrderDetails,
        serviceItem: serviceItemId,
      }));
    }
  }, [serviceItemId]);

  useEffect(() => {
    fetchServiceItemData();
  }, []);

  const fetchServiceItemData = async () => {
    try {
      setLoading(true);
      const { data } = (await getAllDataOfServiceItem(
        serviceItemId as string
      )) as AllDataOfServiceItemResult;
      setServiceItemData(data ?? []);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  };

  useEffect(() => {
    if (serviceItemData.length) {
      if (step === serviceItemData[0].steps.length) {
        setTimerOn(true);
      }
      if (step === serviceItemData[0].steps.length - 1) {
        setTimerOn(false);
        setTimeLeft(240);
      }
    }
  }, [serviceItemData, step]);

  useEffect(() => {
    let timer: any;

    if (timerOn) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [timerOn]);

  useEffect(() => {
    if (timeLeft === 0) {
      navigate('/');
    }
  }, [timeLeft]);

  const handleCreateOrder = useCallback(
    async (answers: any) => {
      setLoading(true);
      try {
        const newOrder = await createOrder(answers);
        navigate(`/confirmation/${newOrder.data._id}`);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        toast.error('Something went wrong! Please try again');
      }
    },
    [serviceItemData]
  );

  const handleCreatePaymentIntent = useCallback(
    async (amount: number, customerId: string, emailId: string) => {
      try {
        const paymentPayload: IPaymentPayload = { amount, customerId, emailId };
        const newPayment = await createPaymentIntent(paymentPayload);
        return newPayment;
      } catch (error) {
        toast.error('Something went wrong! Please try again');
      }
    },
    [isProcessing]
  );

  const handleGetCustomer = useCallback(
    async (emailId: string, name: string) => {
      try {
        const customerPayload: IGetCustomerPayload = { emailId, name };
        const customer = await getCustomer(customerPayload);
        return customer;
      } catch (error) {
        toast.error('Something went wrong! Please try again');
      }
    },
    [isProcessing]
  );

  attachCustomer;

  const handleAttachCustomer = useCallback(
    async (paymentMethodId: string, customerId: string) => {
      try {
        const customerPayload: IAttachCustomerPayload = { paymentMethodId, customerId };
        const customer = await attachCustomer(customerPayload);
        return customer;
      } catch (error) {
        toast.error('Something went wrong! Please try again');
      }
    },
    [isProcessing]
  );

  useEffect(() => {
    if (
      address &&
      step < serviceItemData[0].steps.length &&
      serviceItemData[0].steps[step].serviceItemQuestions[0].type === QuestionType.LOCATION
    ) {
      setOrderDetails((prevOrderDetails: any) => ({
        ...prevOrderDetails,
        [`${serviceItemData[0].steps[step].serviceItemQuestions[0].description}`]: address,
      }));
    }
  }, [address, step]);

  useEffect(() => {
    if (
      serviceItemData.length &&
      serviceItemData[0].steps[step].serviceItemQuestions.some(
        (question) => question.type === QuestionType.ROUTE
      )
    ) {
      setOrderDetails((prevOrderDetails: any) => ({
        ...prevOrderDetails,
        'Pickup location': origin,
        'Drop location': destination,
      }));
    }
  }, [origin, destination]);

  useEffect(() => {
    if (checkoutError) {
      toast.error(checkoutError);
    }
  }, [checkoutError]);

  const iframeStyles = {
    base: {
      color: '#213547',
      fontSize: '16px',
      iconColor: '#213547',
      '::placeholder': {
        color: '#CFD7E0',
      },
    },
    invalid: {
      iconColor: '#d92d20',
      color: '#d92d20',
    },
    complete: {
      iconColor: '#12b76a',
    },
  };

  const handleCardDetailsChange = (ev: any) => {
    ev.error ? setCheckoutError(ev.error.message) : setCheckoutError(null);
  };

  const cardElementOpts: StripeCardElementOptions = {
    iconStyle: 'solid',
    style: iframeStyles,
    hidePostalCode: true,
  };

  const handleFormSubmit: any = async (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    const price = (total + serviceItemData[0].basePrice) * 100;

    const billingDetails = {
      name: orderDetails.Name,
      email: orderDetails.Email,
      phone: orderDetails['Phone Number'],
      address: {
        city: 'test',
        line1: 'test',
        state: 'test',
        postal_code: '56465',
      },
    };

    setProcessingTo(true);

    const cardElement = elements?.getElement('card');

    try {
      const customer = await handleGetCustomer(billingDetails.email, billingDetails.name);
      const data = await handleCreatePaymentIntent(
        price,
        customer.data.stripeCustomerId,
        billingDetails.email
      );

      const paymentMethodReq = await stripe?.createPaymentMethod({
        type: 'card',
        card: cardElement!,
        billing_details: billingDetails,
      });

      await handleAttachCustomer(
        paymentMethodReq?.paymentMethod?.id ?? '',
        customer.data.stripeCustomerId
      );

      if (paymentMethodReq?.error) {
        setCheckoutError(paymentMethodReq.error.message);
        setProcessingTo(false);
        return;
      }

      const result = await stripe?.confirmCardPayment(data, {
        payment_method: paymentMethodReq?.paymentMethod?.id!,
      });

      if (result?.error) {
        const { message } = result.error;
        setCheckoutError(message);
        setProcessingTo(false);
        return;
      }

      const paymentIntent = result?.paymentIntent;

      if (paymentIntent?.status === 'succeeded') {
        await handleCreateOrder(orderDetails);
      } else {
        setCheckoutError('Payment failed.');
        setProcessingTo(false);
      }
    } catch (err: any) {
      setCheckoutError(err?.message);
    }
  };

  const handleAutoNext = async (arg: any) => {
    setClicking(true);
    const { key, value } = arg;
    handleOptionClick({ key, value })
      .then((updatedOrderDetails) => handleClick('next', updatedOrderDetails))
      .catch((error) => {
        console.error(error);
      });
  };

  const handleClick = async (arg: 'next' | 'back', updatedOrderDetails: any): Promise<any> => {
    const finalOrderDetails = updatedOrderDetails || orderDetails;
    if (arg === 'next') {
      if (step < serviceItemData[0].steps.length) {
        if (serviceItemData[0].isDistanceApplicable && distance) {
          setOrderDetails((prevOrderDetails: any) => ({
            ...prevOrderDetails,
            distance: distance,
          }));
        }
        let res = serviceItemData[0].steps[step].serviceItemQuestions.map((question) => {
          if (
            question.type !== QuestionType.ROUTE &&
            (!finalOrderDetails[`${question.description}`] ||
              !finalOrderDetails[`${question.description}`].trim())
          ) {
            toast.error(`please provide ${question.description}`);
            setClicking(false);
            return 'error';
          }
          if (question.type === QuestionType.FORMFIELD) {
            const fieldValue = finalOrderDetails[`${question.description}`];

            const pattern =
              question.formFieldType === 'tel'
                ? /^\d{10}$/
                : question.formFieldType === 'email'
                  ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/
                  : undefined;
            if (pattern && fieldValue && !pattern.test(fieldValue.trim())) {
              toast.error(`Please provide a valid ${question.description}`);
              setClicking(false);
              return 'error';
            }
          }
          if (
            question.type === QuestionType.ROUTE &&
            question.index % 2 === 0 &&
            (!finalOrderDetails[`${question.description}`] ||
              !finalOrderDetails[`${question.description}`].trim())
          ) {
            toast.error('please click on calculate route after providing locations');
            setClicking(false);
            return 'error';
          }
        });
        if (res?.includes('error')) {
          setClicking(false);
          return;
        }
      }
      if (step === serviceItemData[0].steps.length + 1) {
        // handleCreateOrder(orderDetails);
        //   let errors: any = {};
        //   if (meta.erroredInputs.cardNumber) {
        //     errors.cardNumber = meta.erroredInputs.cardNumber;
        //   }
        //   if (meta.erroredInputs.expiryDate) {
        //     errors.expiryDate = meta.erroredInputs.expiryDate;
        //   }
        //   if (meta.erroredInputs.cvc) {
        //     errors.cvc = meta.erroredInputs.cvc;
        //   }
        //   return errors;
        // setLoading(true);
        // try {
        //   const res = await updateOrderStatus(orderId ?? '', { status: 'Payment Successful' });
        //   if (res?.success) {
        //     toast.success(res?.msg ?? '');
        //   } else {
        //     throw new Error();
        //   }
        // } catch (error) {
        //   setLoading(false);
        //   toast.error('Something went wrong! Please try again');
        // }
      }

      setStep(step + 1);
    }
    if (arg === 'back') {
      if (step === 0) {
        navigate(`/`);
      }
      setStep(step - 1);
    }
    setClicking(false);
  };

  const handleOptionClick = async (arg: any) => {
    const { key, value } = arg;
    const updatedOrderDetails = await new Promise((resolve) => {
      setOrderDetails((prevOrderDetails: any) => {
        const updatedDetails = {
          ...prevOrderDetails,
          [key]: value,
        };
        resolve(updatedDetails);
        return updatedDetails;
      });
    });

    return updatedOrderDetails;
  };

  const handleInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setOrderDetails((prevOrderDetails: any) => ({
      ...prevOrderDetails,
      [name]: value,
    }));
  };

  return (
    <>
      <div className={styles.container}>
        {loading || !serviceItemData.length ? (
          <div className={styles.loader}>
            <Loader />
          </div>
        ) : (
          <>
            <div className={styles.top}>
              <div
                className={styles['back-button']}
                onClick={() => {
                  navigate(`/`);
                }}>
                <BackArrow />
              </div>
              <div className={styles['top-data']}>
                <div className={styles['bottom-service-image']}>
                  <img
                    src={`${AWS_ACCESS_URL}/${serviceItemData[0].imagePath}`}
                    alt="serviceImage"
                  />
                </div>
                <div className={styles['bottom-service-description']}>
                  {serviceItemData[0].name}
                </div>
              </div>
            </div>
            <div className={styles.bottom}>
              {step < serviceItemData[0].steps.length && (
                <>
                  <div className={styles['bottom-title']}>
                    {serviceItemData[0].steps[step].title}
                  </div>
                </>
              )}

              {step < serviceItemData[0].steps.length &&
                serviceItemData[0].steps[step].serviceItemQuestions.map((question, index) => {
                  return (
                    <div
                      key={`${question}${index}`}
                      style={{
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}>
                      {question.type !== QuestionType.FORMFIELD &&
                        question.type !== QuestionType.ROUTE && (
                          <div className={styles['bottom-description']}>{question.title}</div>
                        )}
                      {question.type === QuestionType.BOOLEAN && (
                        <>
                          <div className={styles['bottom-buttons']}>
                            <Button
                              onClick={
                                serviceItemData[0].steps[step].serviceItemQuestions.length === 1
                                  ? () =>
                                      handleAutoNext({ key: question.description, value: 'Yes' })
                                  : () =>
                                      handleOptionClick({ key: question.description, value: 'Yes' })
                              }
                              theme={'primary'}
                              selected={orderDetails?.[`${question.description}`] === 'Yes'}
                              fullWidth={true}
                              className={
                                styles[
                                  `button${
                                    orderDetails?.[`${question.description}`] === 'Yes'
                                      ? '-selected'
                                      : ''
                                  }`
                                ]
                              }>
                              Yes
                            </Button>
                            <Button
                              onClick={
                                serviceItemData[0].steps[step].serviceItemQuestions.length === 1
                                  ? () => handleAutoNext({ key: question.description, value: 'No' })
                                  : () =>
                                      handleOptionClick({ key: question.description, value: 'No' })
                              }
                              theme={'secondary'}
                              selected={orderDetails?.[`${question.description}`] === 'No'}
                              fullWidth={true}
                              className={
                                styles[
                                  `button${
                                    orderDetails?.[`${question.description}`] === 'No'
                                      ? '-selected'
                                      : ''
                                  }`
                                ]
                              }>
                              No
                            </Button>
                          </div>
                        </>
                      )}
                      {question.type === QuestionType.OPTION && (
                        <div
                          className={styles['option-container']}
                          style={{
                            gridTemplateColumns: `repeat(${
                              question.options.length <= 3 ? question.options.length : 3
                            }, 1fr)`,
                          }}>
                          {question.options.map((option, index) => {
                            return (
                              <div
                                className={
                                  styles[
                                    `option${
                                      orderDetails?.[`${question.description}`] ===
                                      `${option.title}:${option._id}`
                                        ? '-selected'
                                        : ''
                                    }`
                                  ]
                                }
                                key={option.title + index}
                                onClick={
                                  serviceItemData[0].steps[step].serviceItemQuestions.length === 1
                                    ? () =>
                                        handleAutoNext({
                                          key: question.description,
                                          value: `${option.title}:${option._id}`,
                                        })
                                    : () =>
                                        handleOptionClick({
                                          key: question.description,
                                          value: `${option.title}:${option._id}`,
                                        })
                                }>
                                <div className={styles['option-image']}>
                                  <img
                                    src={`${AWS_ACCESS_URL}/${option.imagePath}`}
                                    alt="optionImage"
                                  />
                                </div>
                                <div className={styles['option-title']}>{option.title}</div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                      {question.type === QuestionType.FORMFIELD && (
                        <div className={styles['bottom-info']}>
                          <div className={styles['info-container']}>
                            <label className={styles['info-label']}>{question.title}</label>
                            <input
                              className={styles['info-input']}
                              type={question.formFieldType}
                              name={question.description}
                              pattern={
                                question.formFieldType === 'tel'
                                  ? '/^d{10}$/'
                                  : question.formFieldType === 'email'
                                    ? '/^[^s@]+@[^s@]+.[^s@]+$/'
                                    : undefined
                              }
                              maxLength={question.formFieldType === 'tel' ? 10 : undefined}
                              onChange={handleInfoChange}
                              defaultValue={orderDetails[question.description] || ''}
                              style={{ textAlign: 'center' }}
                            />
                          </div>
                        </div>
                      )}

                      {question.type === QuestionType.LOCATION && (
                        <div className={styles['map-container-main']}>
                          <Map setAddress={setAddress} address={address} />
                        </div>
                      )}

                      {question.type === QuestionType.ROUTE && question.index % 2 === 0 && (
                        <div className={styles['map-container-main']}>
                          <RouteMap
                            setOrigin={setOrigin}
                            setDestination={setDestination}
                            origin={origin}
                            destination={destination}
                            distance={distance}
                            setDistance={setDistance}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}

              {step === serviceItemData[0].steps.length && (
                <>
                  <div className={styles['bottom-title']}>{`Step ${step + 2}: Your Quote`}</div>
                  <div className={styles['bottom-description']}></div>
                  <div className={styles['discount-container']}>
                    <div className={styles['discount-card']}>
                      <div className={styles['discount-name']}>Discounted Service Quote</div>
                      <div className={styles['discount-price']}>$132.18</div>
                    </div>
                    <div className={styles['request-card-container']}>
                      <div className={styles.tableContainer}>
                        <table>
                          <tbody>
                            <tr>
                              <th>Name</th>
                              <td>{orderDetails.Name}</td>
                            </tr>
                            <tr>
                              <th>Email</th>
                              <td>{orderDetails.Email}</td>
                            </tr>
                            <tr>
                              <th>Contact</th>
                              <td>{orderDetails['Phone Number']}</td>
                            </tr>
                            <tr>
                              <th>Address</th>
                              <td>
                                {serviceItemData[0].isDistanceApplicable
                                  ? orderDetails['Pickup location']
                                  : orderDetails['Address']}
                              </td>
                            </tr>
                            <tr>
                              <th>Base Price</th>
                              <td>${serviceItemData[0].basePrice}</td>
                            </tr>
                            {!serviceItemData[0].isDistanceApplicable &&
                              serviceItemData[0].steps.map((step) => {
                                return step.serviceItemQuestions.map((serviceItemQuestion) => {
                                  return serviceItemQuestion.specificServices?.map(
                                    (specificService) => {
                                      const quantity = Number(
                                        orderDetails[specificService.description]
                                      );
                                      const price = Number(specificService.price);
                                      const subtotal = quantity * price;
                                      total += subtotal;

                                      return (
                                        <React.Fragment key={`${specificService._id}`}>
                                          <tr>
                                            <th
                                              style={{
                                                whiteSpace: 'pre-line',
                                              }}>{`specific service charge\n(${
                                              specificService.description
                                            } : ${
                                              orderDetails[specificService.description]
                                            })\n(price per unit : $${specificService.price})`}</th>
                                            <td>
                                              {quantity} × ${price} = ${subtotal}
                                            </td>
                                          </tr>
                                        </React.Fragment>
                                      );
                                    }
                                  );
                                });
                              })}
                            {serviceItemData[0].isDistanceApplicable &&
                              (() => {
                                const price = Number('5');
                                const subtotal = distance * price;
                                total += subtotal;

                                return (
                                  <React.Fragment>
                                    <tr>
                                      <th
                                        style={{
                                          whiteSpace: 'pre-line',
                                        }}>{`towing charges\n(distance : ${distance}mi)\n(price per mile : $5)`}</th>
                                      <td>
                                        {distance} × ${price} = ${subtotal}
                                      </td>
                                    </tr>
                                  </React.Fragment>
                                );
                              })()}

                            <tr>
                              <th>Total Price</th>
                              <td>${total + serviceItemData[0].basePrice}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleClick('next', orderDetails)}
                      theme={'primary'}
                      fullWidth={true}
                      className={styles.button}>
                      🎉 Secure This Deal Now 🎉
                    </Button>
                    <div className={styles['secure-deal-discount']}>We helped you save $42.30</div>
                    <div className={styles['waiting-card']}>
                      <div className={styles['expire-title']}>Your Deal Expires Soon</div>
                      <div className={styles['expire-time']}>{`${Math.floor(timeLeft / 60)
                        .toString()
                        .padStart(2, '0')}:${(timeLeft % 60).toString().padStart(2, '0')}`}</div>
                      <div className={styles['expire-description']}>
                        This price is 32% lower than average. The price may be higher if it expires.
                      </div>
                    </div>
                  </div>
                </>
              )}

              {step === serviceItemData[0].steps.length + 1 && (
                <>
                  <div className={styles['bottom-title']}>{`Step ${
                    step + 3
                  }: Your Instant Quote is Here`}</div>
                  <div className={styles['bottom-description']}></div>
                  <div className={styles['payment-container']}>
                    <div className={styles['discount-card']}>
                      <div className={styles['discount-name']}>Discounted Service Quote</div>
                      <div className={styles['discount-price']}>$132.18</div>
                    </div>
                    <div className={styles['info-container']}>
                      <label className={styles['info-label']}>Name</label>
                      <input
                        className={styles['info-input']}
                        type="text"
                        name="Name"
                        // onChange={handleInfoChange}
                        defaultValue={orderDetails.Name}
                        style={{ textAlign: 'center' }}
                      />
                    </div>
                    <div className={styles['card-detail-container']}>
                      <label className={styles['card-detail-label']}>Payment Method</label>
                      <div className={styles['card-credential']}>
                        <CardElementContainer>
                          <CardElement
                            options={cardElementOpts}
                            onChange={handleCardDetailsChange}
                          />
                        </CardElementContainer>
                      </div>
                    </div>
                    <Button
                      onClick={handleFormSubmit}
                      theme={'primary'}
                      fullWidth={true}
                      className={styles.button}
                      disabled={isProcessing || !stripe}>
                      {isProcessing ? 'Processing...' : '🎉 Pay Now and Save 🎉'}
                    </Button>

                    <div className={styles['waiting-card']}>
                      <div className={styles['expire-title']}>Your Deal Expires Soon</div>
                      <div className={styles['expire-time']}>{`${Math.floor(timeLeft / 60)
                        .toString()
                        .padStart(2, '0')}:${(timeLeft % 60).toString().padStart(2, '0')}`}</div>
                      <div className={styles['expire-description']}>You are saving $42.30</div>
                    </div>
                  </div>
                </>
              )}

              <div className={styles['step-container']}>
                {(step < serviceItemData[0].steps.length ||
                  step === serviceItemData[0].steps.length + 2) && (
                  <div className={styles.imageContainer}>
                    <img src={'/images/home.png'} alt="garageImage" />
                  </div>
                )}
                {step <= serviceItemData[0].steps.length + 1 && (
                  <div className={styles.quotation}>
                    {step === serviceItemData[0].steps.length + 1
                      ? 'There are 17 people behind you. If you cancel, you may not get another tow.'
                      : `Your quote is almost ready`}
                  </div>
                )}
                {step <= serviceItemData[0].steps.length + 1 && (
                  <div className={styles['step-bar']}>
                    <div
                      style={{
                        width: `${((step + 1) / (serviceItemData[0].steps.length + 2)) * 100}%`,
                      }}
                      className={styles['step-position']}></div>
                  </div>
                )}

                {step <= serviceItemData[0].steps.length + 2 && (
                  <div className={styles['bottom-buttons-row']}>
                    <Button
                      onClick={() => handleClick('back', orderDetails)}
                      theme={'secondary'}
                      fullWidth={true}
                      className={styles.button}>
                      Back
                    </Button>
                    <Button
                      onClick={
                        step === serviceItemData[0].steps.length + 1
                          ? handleFormSubmit
                          : () => handleClick('next', orderDetails)
                      }
                      theme={'primary'}
                      fullWidth={true}
                      className={styles.button}
                      disabled={isProcessing || !stripe || clicking}>
                      {isProcessing
                        ? 'Processing...'
                        : step === serviceItemData[0].steps.length
                          ? 'Secure Deal'
                          : 'Next'}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Service;
