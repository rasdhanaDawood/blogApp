import { Link } from 'react-router-dom'
import pageNotFound from '../images/404-error-page.jpg'
import logo from '../images/logo.png'

const PageNotFound = () => {
    return (
        <section className='h-cover relative p-10 flex flex-col items-center gap-20 text-center'>
            <img src={pageNotFound} className='select-none border-2 border-gray-200 w-72 aspect-square object-cover rounded' />
            
            <h1 className='text-4xl font-gelasio leading-7'>Page not found</h1>
            <p className='text-gray-600 text-xl leading-7 -mt-8'>The page you are looking for does not exists.
                Head back to <Link to='/' className='text-cyan-800 underline text-xl'>Home page</Link>
            </p>
            <div className='mt-auto'>
                <img src={logo} className='h-10 object-contain block mx-auto select-none' />
                <p className='mt-5 text-gray-600'>Read millions of stories around the world</p>

            </div>
        </section>
    )
}

export default PageNotFound