import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router'
import Header from '../../components/Header';
import Prismic from '@prismicio/client';
import { FiUser, FiCalendar, FiClock } from 'react-icons/fi';
import { RichText } from 'prismic-dom';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { Comments } from '../../components/Comments';

interface Post {
  uid: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const router = useRouter();

  if (router.isFallback) {
    return <div>Carregando...</div>
  }

  return (
    <>
      <Header />
      
      <img 
        src={post.data.banner.url}
        alt="banner" 
        className={styles.banner}
      />

      <main className={commonStyles.container}>
        <article className={styles.post}>
          <h1>{post.data.title}</h1>

          <div className={styles.dateAndAuthor}>
            <div>
              <FiCalendar size={20} />
              <span>
                {
                  format(new Date(post.first_publication_date), 'dd MMM yyyy', {
                    locale: ptBR
                  }).toString()
                }
              </span>
            </div>

            <div>
              <FiUser size={20} />
              <span>{post.data.author}</span>
            </div>    

            <div>
              <FiClock size={20} />
              <span>4 min</span>
            </div>           
          </div>

          <section>
            {post.data.content.map(p => (
              <div key={p.heading} className={styles.section}>
                <h2>{p.heading}</h2>
                <div dangerouslySetInnerHTML={{__html: RichText.asHtml(p.body)}}/>
              </div>
            ))}
          </section>

        </article>

      </main>

      <Comments />

    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query([
    Prismic.Predicates.at('document.type', 'posts')
  ], {
    fetch: [],
    pageSize: 20
  });

  const postsPaths = posts.results.map(result => {
    return {
      params: {
        slug: result.uid
      }
    }
  })

  return {
    paths: postsPaths,
    fallback: true
  };

};

export const getStaticProps: GetStaticProps = async context => {
  const { slug } = context.params;
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {});

  const post: Post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      banner: {
        url: response.data.banner.url
      },
      author: response.data.author,
      content: response.data.content.map(section =>{
        return {
          heading: section.heading,
          body: section.body
        }
      })
    }
  };

  return {
    props: { post }
  }
};
