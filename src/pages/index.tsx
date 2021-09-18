import { useState } from 'react';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { getPrismicClient } from '../services/prismic';
import Prismic from '@prismicio/client';
import { FiUser, FiCalendar } from 'react-icons/fi';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

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

  const [nextPage, setNextPage] = useState(postsPagination.next_page);
  const [posts, setPosts] = useState<Post[]>(postsPagination.results);

  async function handleLoadPosts() {
    const { next_page, results } = await (await fetch(postsPagination.next_page)).json();
    setNextPage(next_page);

    const newPosts: Post[] = results.map(result => {
      return {
        uid: result.uid,
        first_publication_date: result.first_publication_date,
        data: {
          title: result.data.title,
          subtitle: result.data.subtitle,
          author: result.data.author
        }
      }
    });

    setPosts([
      ...posts,
      ...newPosts
    ]);
  }

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
            posts.map(post => (
              <Link href={`/post/${post.uid}`} key={post.uid}>
                <a>
                  <strong>{post.data.title}</strong>
                  <p>{post.data.subtitle}</p>
    
                  <div>
                    <div className={styles.info}>
                      <FiCalendar size={20} />
                      <span>
                        {
                          format(new Date(post.first_publication_date), 'dd MMM yyyy', {
                            locale: ptBR
                          }).toString()
                        }
                      </span>
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
            nextPage !== null && (
              <button 
                type="button"
                className={styles.loadPosts}
                onClick={handleLoadPosts}
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
