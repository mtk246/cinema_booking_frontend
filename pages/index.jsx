import Head from 'next/head'
import styles from '../styles/Home.module.sass'
import useTranslation from 'next-translate/useTranslation';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const { t } = useTranslation('common');

  return (
    <div className={styles.container}>
      <Head>
        <title>{t('meta_title_home')}</title>
        <meta name='description' content='iManage Factory by Khit Kabar' />
        <link rel='icon' href='/img/logo.svg' />
      </Head>
    </div>
  )
}
