import styles from './Footer.module.scss';

const Footer = ({ ...rest }) => {
  return (
    <footer className={styles.footer} {...rest}>
      Info &amp; Images via&nbsp;<a href="https://strangerthings.fandom.com/wiki/Stranger_Things_Wiki">Stranger Things Wiki</a>
    </footer>
  )
}

export default Footer;