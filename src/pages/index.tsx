import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { getPrismicClient } from '../services/prismic';
import Prismic from '@prismicio/client';
import { FiUser, FiCalendar } from 'react-icons/fi';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  return (
    <>
      <Head>
        <title>Home | Spacetravelling</title>
      </Head>

      <main className={commonStyles.container}>
        <Link href="/">
          <a>
            <img src="images/logo.svg" alt="logo" className={styles.logo}/>
          </a>
        </Link>
        
        <section className={styles.posts}>

          {
            postsPagination.results.map(post => (
              <Link href={`/post/${post.uid}`} key={post.uid}>
                <a>
                  <strong>{post.data.title}</strong>
                  <p>{post.data.subtitle}</p>
    
                  <div>
                    <div className={styles.info}>
                      <FiCalendar size={20} />
                      <span>{post.first_publication_date}</span>
                    </div>
    
                    <div className={styles.info}>
                      <FiUser size={20} />
                      <span>{post.data.author}</span>
                    </div>              
                  </div>
                </a>          
              </Link>              
            ))
          }


          {
            postsPagination.next_page !== null && (
              <button 
                type="button"
                className={styles.loadPosts}
              >
                Carregar mais posts
              </button>
            )
          }


        </section>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query([
    Prismic.Predicates.at('document.type', 'posts')
  ], {
    fetch: ['posts.title', 'posts.subtitle', 'posts.author'],
    pageSize: 1
  });

  const posts: Post[] = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author
      }
    }
  });

  const postsPagination: PostPagination = {
    next_page: postsResponse.next_page,
    results: posts    
  }; 

  return {
    props: {
      postsPagination
    }
  }
};
