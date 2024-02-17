import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './home.module.scss';
import { getServiceItems } from '../../services';
import { ServiceItemData, ServiceItemResult } from '../../types/serviceItem.tpes';
import { Loader } from '../../components/Loader';
const AWS_ACCESS_URL = import.meta.env.VITE_REACT_APP_AWS_ACCESS_URL;

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [serviceItems, setServiceItems] = useState<ServiceItemData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchServiceItems();
  }, []);

  const fetchServiceItems = async () => {
    try {
      setLoading(true);
      const { data } = (await getServiceItems()) as ServiceItemResult;
      setServiceItems(data ?? []);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  };

  return (
    <div className={styles.container}>
      {loading || !serviceItems ? (
        <div className={styles.loader}>
          <Loader />
        </div>
      ) : (
        <>
          <div className={styles.top}>
            <div className={styles.content}>
              <div className={styles.title}>Get an Instant Quote For Your Roadside Issue</div>
              <div className={styles.description}>Best Rates, Fastest Times</div>
            </div>
            <div className={styles.imageContainer}>
              <img src={'/images/home.png'} alt="garageImage" />
            </div>
          </div>
          <div className={styles.bottom}>
            <div className={styles['bottom-title']}>Step 1: Select a Service</div>
            <div className={styles['bottom-service-container']}>
              {serviceItems &&
                serviceItems.map((serviceItem: ServiceItemData, index: number) => (
                  <div
                    className={styles['bottom-service']}
                    key={serviceItem.name + index}
                    onClick={() => navigate(`/service/${serviceItem._id}`)}>
                    <div className={styles['bottom-service-image']}>
                      <img src={`${AWS_ACCESS_URL}/${serviceItem.imageName}`} alt="garageImage" />
                    </div>
                    <div className={styles['bottom-service-description']}>{serviceItem.name}</div>
                  </div>
                ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Home;
