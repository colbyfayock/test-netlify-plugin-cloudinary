import Container from '@components/Container';

import styles from './Header.module.scss';

const Header = () => {
  return (
    <header className={styles.header}>
      <Container className={styles.headerContainer}>
        <p className={styles.headerTitle}>
          <img src="https://i.imgur.com/HYOh0mO.png" alt="Stranger Things" />
        </p>
      </Container>
    </header>
  )
}

export default Header;