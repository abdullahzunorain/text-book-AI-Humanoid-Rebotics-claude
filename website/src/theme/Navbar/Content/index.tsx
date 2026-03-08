import React, {useEffect} from 'react';
import Content from '@theme-original/Navbar/Content';
import type ContentType from '@theme/Navbar/Content';
import type {WrapperProps} from '@docusaurus/types';
import AuthButton from '@site/src/components/AuthButton';

type Props = WrapperProps<typeof ContentType>;

/**
 * Wrapper around the original Navbar/Content to inject the AuthButton.
 * The AuthButton is positioned so it remains visible on both desktop and
 * mobile viewports (Docusaurus hides navbar items below 996px).
 * 
 * T012: Added style hook class 'navbar-content-wrapper' for premium UI styling
 * T067: Added scroll-threshold class toggling for navbar scrolled state
 */
export default function ContentWrapper(props: Props): React.JSX.Element {
  useEffect(() => {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    const handleScroll = () => {
      if (window.scrollY > 10) {
        navbar.classList.add('navbar--scrolled');
      } else {
        navbar.classList.remove('navbar--scrolled');
      }
    };

    window.addEventListener('scroll', handleScroll, {passive: true});
    handleScroll(); // initial check
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="navbar-content-wrapper" style={{display: 'flex', alignItems: 'center', width: '100%'}}>
      <div style={{flex: 1}}>
        <Content {...props} />
      </div>
      <div className="navbar__auth-button">
        <AuthButton />
      </div>
    </div>
  );
}
