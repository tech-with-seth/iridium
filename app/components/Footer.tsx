import { Link } from 'react-router';
import { Container } from './Container';

export function Footer() {
    return (
        <footer className="footer sm:footer-horizontal bg-base-200 text-base-content p-10">
            <nav>
                <h6 className="footer-title">Services</h6>
                <Link to="" className="link link-hover">
                    Branding
                </Link>
                <Link to="" className="link link-hover">
                    Design
                </Link>
                <Link to="" className="link link-hover">
                    Marketing
                </Link>
                <Link to="" className="link link-hover">
                    Advertisement
                </Link>
            </nav>
            <nav>
                <h6 className="footer-title">Company</h6>
                <Link to="" className="link link-hover">
                    About us
                </Link>
                <Link to="" className="link link-hover">
                    Contact
                </Link>
                <Link to="" className="link link-hover">
                    Jobs
                </Link>
                <Link to="" className="link link-hover">
                    Press kit
                </Link>
            </nav>
            <nav>
                <h6 className="footer-title">Legal</h6>
                <Link to="" className="link link-hover">
                    Terms of use
                </Link>
                <Link to="" className="link link-hover">
                    Privacy policy
                </Link>
                <Link to="" className="link link-hover">
                    Cookie policy
                </Link>
            </nav>
            <form>
                <h6 className="footer-title">Newsletter</h6>
                <fieldset className="w-80">
                    <label>Enter your email address</label>
                    <div className="join">
                        <input
                            type="text"
                            placeholder="username@site.com"
                            className="input input-bordered join-item"
                        />
                        <button className="btn btn-primary join-item">
                            Subscribe
                        </button>
                    </div>
                </fieldset>
            </form>
        </footer>
    );
}
