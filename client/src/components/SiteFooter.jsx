import Icon from './ui/Icon.jsx';

export default function SiteFooter() {
  return (
    <footer className="pf-footer">
      <div className="pf-container pf-footer__inner">
        <p>&copy; {new Date().getFullYear()} PropertyFinder. All rights reserved.</p>
        <p className="pf-row">
          <Icon name="mail" size={15} />
          <a href="mailto:propertyfinder428@gmail.com">propertyfinder428@gmail.com</a>
        </p>
      </div>
    </footer>
  );
}
