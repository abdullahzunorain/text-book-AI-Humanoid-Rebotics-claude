import React, {type ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

import styles from './index.module.css';

/* ── Data Models (T020, T042, T047) ── */

interface FeatureCard {
  id: string;
  icon: string;
  title: string;
  description: string;
}

interface WorkflowStep {
  stepNumber: number;
  icon: string;
  title: string;
  summary: string;
}

interface StatMetric {
  label: string;
  value: string;
}

const features: FeatureCard[] = [
  {id: 'structured', icon: '📚', title: 'Structured Learning', description: 'Comprehensive textbook covering Physical AI fundamentals and ROS 2 — from architecture to URDF robot models.'},
  {id: 'ai-companion', icon: '🤖', title: 'AI Study Companion', description: 'An embedded chatbot on every page to answer your questions about the content — powered by RAG and Gemini.'},
  {id: 'highlight', icon: '🎯', title: 'Highlight & Ask', description: 'Select any text in the textbook and ask the AI to explain it. Context-aware answers about exactly what you\'re reading.'},
  {id: 'urdu', icon: '🌐', title: 'Urdu Translation', description: 'Full Urdu RTL translation for every chapter — making Physical AI education accessible to millions more learners.'},
  {id: 'personalized', icon: '🔐', title: 'Personalized Learning', description: 'Sign in to get AI answers tailored to your background, learning goals, and preferred explanation style.'},
  {id: 'interactive', icon: '🖱️', title: 'Interactive Content', description: 'Hands-on exercises, code examples, and visual diagrams that bring robotics concepts to life.'},
];

const workflowSteps: WorkflowStep[] = [
  {stepNumber: 1, icon: '📖', title: 'Read a Chapter', summary: 'Dive into comprehensive lessons on Physical AI, ROS 2, and humanoid robotics fundamentals.'},
  {stepNumber: 2, icon: '💬', title: 'Ask the AI', summary: 'Highlight text or open the chatbot to ask questions about anything you just read.'},
  {stepNumber: 3, icon: '✨', title: 'Get Personalized Answers', summary: 'Receive AI explanations tailored to your learning level and goals.'},
];

const stats: StatMetric[] = [
  {value: '12+', label: 'Chapters'},
  {value: '6', label: 'Modules'},
  {value: 'AI-Powered', label: 'Study Companion'},
];

/* ── Hero Section (US1) ── */

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className={clsx('container', styles.heroContent)}>
        <div className={styles.heroShimmerBadge}>
          <span>✨ Interactive AI Textbook</span>
        </div>

        <Heading as="h1" className={clsx('hero__title', styles.heroTitle)}>
          {siteConfig.title}
        </Heading>
        <p className={styles.heroSubtitle}>{siteConfig.tagline}</p>

        <div className={styles.buttons}>
          <Link className={styles.heroCta} to="/docs/intro">
            Start Reading →
          </Link>
          <Link
            className={styles.heroGhostCta}
            to="https://github.com/abdullahzunorain/text-book-AI-Humanoid-Rebotics-CLAUDE">
            View on GitHub →
          </Link>
        </div>
      </div>

      <div className={styles.heroMeshOverlay} aria-hidden="true" />
      <div className={styles.heroGlowOrb} aria-hidden="true" />
    </header>
  );
}

/* ── Features Section (US2) ── */

function FeaturesSection() {
  return (
    <section className={styles.featuresSection}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <Heading as="h2" className={styles.featuresSectionHeading}>
            Why Students Love This
          </Heading>
        </div>
        <div className={styles.featuresGrid}>
          {features.map((f) => (
            <div key={f.id} className={styles.featureCard}>
              <span className={styles.featureIcon}>{f.icon}</span>
              <Heading as="h3">{f.title}</Heading>
              <p>{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── How It Works Section (US3) ── */

function WorkflowSection() {
  return (
    <section className={styles.workflowSection}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <Heading as="h2" className={styles.featuresSectionHeading}>
            How It Works
          </Heading>
        </div>
        <div className={styles.workflowSteps}>
          {workflowSteps.map((step, idx) => (
            <React.Fragment key={step.stepNumber}>
              {idx > 0 && <div className={styles.workflowConnector} aria-hidden="true" />}
              <div className={styles.workflowStep}>
                <div className={styles.workflowStepNumber}>
                  <span>{step.icon}</span>
                </div>
                <Heading as="h3">{step.title}</Heading>
                <p>{step.summary}</p>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Stats Section (US4) ── */

function StatsSection() {
  return (
    <section className={styles.statsSection}>
      <div className="container">
        <div className={styles.statsGrid}>
          {stats.map((s) => (
            <div key={s.label} className={styles.statItem}>
              <span className={styles.statValue}>{s.value}</span>
              <span className={styles.statLabel}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Page Root ── */

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title="Home"
      description="An interactive textbook on Physical AI and Humanoid Robotics with an embedded AI study companion.">
      <HomepageHeader />
      <main>
        <FeaturesSection />
        <WorkflowSection />
        <StatsSection />
      </main>
    </Layout>
  );
}
