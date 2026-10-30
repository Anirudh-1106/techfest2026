import { Link } from "react-router-dom";

function NotFound() {

    return (

        <main className="not-found">

            <h1>404 - Page Not Found</h1>

            <p>
                The page you are looking for does not exist.
            </p>

            <Link to="/">
                Return to Home
            </Link>

        </main>

    );

}

export default NotFound;