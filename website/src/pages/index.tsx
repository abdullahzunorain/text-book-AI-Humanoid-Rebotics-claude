import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className={clsx('hero__title', styles.heroTitle)}>
          {siteConfig.title}
        </Heading>
        <p className={styles.heroSubtitle}>{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className={styles.heroCta}
            to="/docs/intro">
            Start Reading →
          </Link>
        </div>
      </div>
    </header>
  );
}

function Features() {
  return (
    <section style={{padding: '3rem 0'}}>
      <div className="container">
        <div className="row" style={{gap: '0', rowGap: '1.5rem'}}>
          <div className="col col--4">
            <div className={clsx('text--center', styles.featureCard)}>
              <span className={styles.featureIcon}>📚</span>
              <Heading as="h3">Structured Learning</Heading>
              <p>
                Comprehensive textbook covering Physical AI fundamentals and
                ROS 2 — from architecture to URDF robot models.
              </p>
            </div>
          </div>
          <div className="col col--4">
            <div className={clsx('text--center', styles.featureCard)}>
              <span className={styles.featureIcon}>🤖</span>
              <Heading as="h3">AI Study Companion</Heading>
              <p>
                An embedded chatbot on every page to answer your questions about
                the content — powered by RAG and Gemini.
              </p>
            </div>
          </div>
          <div className="col col--4">
            <div className={clsx('text--center', styles.featureCard)}>
              <span className={styles.featureIcon}>🖱️</span>
              <Heading as="h3">Highlight &amp; Ask</Heading>
              <p>
                Select any text in the textbook and ask the AI to explain it.
                Context-aware answers about exactly what you're reading.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title="Home"
      description="An interactive textbook on Physical AI and Humanoid Robotics with an embedded AI study companion.">
      <HomepageHeader />
      <main>
        <Features />
      </main>
    </Layout>
  );
}
