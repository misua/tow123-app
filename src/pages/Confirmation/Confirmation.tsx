import React, { useEffect, useState } from 'react';
import styles from './confirmation.module.scss';
import BackArrow from '../../assets/svg/BackArrow';
import { useNavigate, useParams } from 'react-router-dom';
import { getAllOrders } from '../../services/order.service';
import { AllOrderResult, OrderData } from '../../types/order.types';
import { Loader } from '../../components/Loader';
import { Button } from '../../components/Button';
import { ConfirmationMap } from '../../components/ConfirmationMap';

const AWS_ACCESS_URL = import.meta.env.VITE_REACT_APP_AWS_ACCESS_URL;

const Confirmation: React.FC = () => {
  const { orderId } = useParams();
  const [loading, setLoading] = useState<boolean>(false);
  const [order, setOrder] = useState<OrderData[]>([]);
  const [step, setStep] = useState<number>(0);
  let total = 0;

  const navigate = useNavigate();

  useEffect(() => {
    if (orderId) {
      fetchServiceItems();
    }
  }, [orderId]);

  const fetchServiceItems = async () => {
    try {
      setLoading(true);
      const { data } = (await getAllOrders(orderId ?? '')) as AllOrderResult;
      setOrder(data ?? []);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  };

  return (
    <>
      <div className={styles.container}>
        {loading || !order.length ? (
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
                  <img src={`${AWS_ACCESS_URL}/${order[0].service.image}`} alt="serviceImage" />
                </div>
                <div className={styles['bottom-service-description']}>{order[0].service.name}</div>
              </div>
            </div>
            <div className={styles.bottom}>
              {step === 0 && (
                <>
                  <div className={styles['bottom-title']}>Your Request is Started</div>
                  <div className={styles['bottom-description']}>Your card has been charged.</div>
                  <div className={styles['request-container']}>
                    <Button
                      onClick={() => console.log('functionality to get faster service')}
                      theme={'primary'}
                      fullWidth={true}
                      className={styles.button}>
                      Click here to get faster service
                    </Button>
                    <div className={styles['request-description']}>
                      Click the button above to become a Tow123 member and get faster service today.
                      Also includes monthly monitoring and service. This is free today and you will
                      be charged $7/month for this membership starting in 7 days.
                    </div>
                  </div>
                  <div className={styles['step-container']}>
                    <div className={styles.imageContainer}>
                      <img src={'/images/home.png'} alt="garageImage" />
                    </div>

                    <div className={styles['bottom-buttons-row']}>
                      <Button
                        onClick={() => setStep(1)}
                        theme={'primary'}
                        fullWidth={true}
                        className={styles.button}>
                        No thanks , Next
                      </Button>
                    </div>
                  </div>
                </>
              )}

              {step === 1 && (
                <>
                  <div className={styles['bottom-title']}>Your Request is Confirmed</div>
                  <div className={styles['bottom-description']}>Your card has been charged.</div>
                  <div className={styles['confirmation-container']}>
                    <div className={styles['confirmation-details-container']}>
                      <div className={styles['confirmation-details']}>
                        <div className={styles['confirmation-details-title']}>Estimated ETA</div>
                        <div className={styles['confirmation-details-value']}>35-60 Minutes</div>
                      </div>
                      <div className={styles['confirmation-details']}>
                        <div className={styles['confirmation-details-title']}>Your Provider</div>
                        <div
                          className={styles['confirmation-details-value']}
                          style={{ whiteSpace: 'pre-line' }}>
                          {'Westcoast Tow\n555-555-5555'}
                        </div>
                      </div>
                    </div>
                    <div className={styles['request-card-container']}>
                      <div className={styles.tableContainer}>
                        <table>
                          <tbody>
                            <tr>
                              <th>ID</th>
                              <td>{order[0]._id}</td>
                            </tr>
                            <tr>
                              <th>Name</th>
                              <td>{order[0].answers.data.Name}</td>
                            </tr>
                            <tr>
                              <th>Email</th>
                              <td>{order[0].answers.data.Email}</td>
                            </tr>
                            <tr>
                              <th>Contact</th>
                              <td>{order[0].answers.data['Phone Number']}</td>
                            </tr>
                            <tr>
                              <th>Address</th>
                              <td>
                                {order[0].answers.data['Address'] ??
                                  order[0].answers.data['Pickup location']}
                              </td>
                            </tr>
                            <tr>
                              <th>Base Price</th>
                              <td>${order[0].service.basePrice}</td>
                            </tr>
                            {!order[0].service.isDistanceApplicable &&
                              order[0].service.specificServices.length > 0 &&
                              order[0].service.specificServices.map((specificService) => {
                                const quantity = Number(
                                  order[0].answers.data[specificService.description]
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
                                        order[0].answers.data[specificService.description]
                                      })\n(price per unit : $${specificService.price})`}</th>
                                      <td>
                                        {quantity} × ${price} = ${subtotal}
                                      </td>
                                    </tr>
                                  </React.Fragment>
                                );
                              })}
                            {order[0].service.isDistanceApplicable &&
                              (() => {
                                const price = Number('5');
                                const subtotal = order[0].answers.data.distance * price;
                                total += subtotal;

                                return (
                                  <React.Fragment>
                                    <tr>
                                      <th
                                        style={{
                                          whiteSpace: 'pre-line',
                                        }}>{`towing charges\n(distance : ${order[0].answers.data.distance}mi)\n(price per mile : $5)`}</th>
                                      <td>
                                        {order[0].answers.data.distance} × ${price} = ${subtotal}
                                      </td>
                                    </tr>
                                  </React.Fragment>
                                );
                              })()}

                            <tr>
                              <th>Total Price</th>
                              <td>${total + order[0].service.basePrice}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                    <div className={styles['confirmation-map']}>
                      <ConfirmationMap
                        address={
                          order[0].answers.data['Address'] ??
                          order[0].answers.data['Pickup location']
                        }
                      />
                    </div>
                    <div className={styles['pickup']}>Pickup Location</div>
                    <Button
                      onClick={() => console.log('functionality to Join Tow123 Membership')}
                      theme={'primary'}
                      fullWidth={true}
                      className={styles.button}>
                      Join Tow123 Membership
                    </Button>
                    <div className={styles['confirmation-description']}>
                      Click the button above to become a Tow123 member and get faster service today.
                      Also includes monthly monitoring and service. This is free today and you will
                      be charged $7/month for this membership starting in 7 days.
                    </div>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Confirmation;
