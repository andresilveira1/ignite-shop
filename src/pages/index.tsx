import 'keen-slider/keen-slider.min.css'

import { useKeenSlider } from 'keen-slider/react'
import { GetStaticProps } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import Stripe from 'stripe'

import { stripe } from '../lib/stripe'
import { HomeContainer, Product } from '../styles/pages/home'

interface ProductsProps {
  products: {
    id: string
    name: string
    imageUrl: string
    price: string
  }[]
}

export default function Home({ products }: ProductsProps) {
  const [sliderRef] = useKeenSlider({
    slides: {
      perView: 1,
    },
    breakpoints: {
      '(min-width: 768px)': {
        slides: {
          perView: 2,
          spacing: 32,
        },
      },
      '(min-width: 1080px)': {
        slides: {
          perView: 3,
          spacing: 48,
        },
      },
    },
  })

  return (
    <>
      <Head>
        <title>Home | Ignite Shop</title>
      </Head>
      <HomeContainer ref={sliderRef} className="keen-slider">
        {products
          ? products.map((product) => {
              return (
                <Link
                  key={product.id}
                  href={`/product/${product.id}`}
                  prefetch={false}
                  className="keen-slider__slide"
                >
                  <Product>
                    <Image
                      src={product.imageUrl}
                      width={520}
                      height={480}
                      alt=""
                    />

                    <footer>
                      <strong>{product.name}</strong>
                      <span>{product.price}</span>
                    </footer>
                  </Product>
                </Link>
              )
            })
          : ''}
      </HomeContainer>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const response = await stripe.products.list({
    expand: ['data.default_price'],
  })
  const products = response.data.map((product) => {
    const price = product.default_price as Stripe.Price
    const formatPrice = (price.unit_amount / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })

    return {
      id: product.id,
      name: product.name,
      imageUrl: product.images[0],
      price: formatPrice,
    }
  })

  return {
    props: {
      products,
    },
    revalidate: 60 * 60 * 2, // 2 hour
  }
}
