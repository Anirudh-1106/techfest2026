import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function Home() {

    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const englishAnnouncements = [
            {
                title: "Hackathon Registrations Open",
                body: "Form your teams and submit your project proposals for the 24-hour flagship hackathon. Exciting cash prizes and mentorship await!"
            },
            {
                title: "Keynote Speakers Announced",
                body: "Join inspiring sessions with tech leaders and industry innovators covering Artificial Intelligence, Cloud, and Web3."
            },
            {
                title: "Workshop Schedule Released",
                body: "Hands-on robotics and machine learning workshops are now open for seat reservations. Limited spots available!"
            }
        ];

        fetch("https://jsonplaceholder.typicode.com/posts?_limit=3")
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Could not load announcements");
                }
                return response.json();
            })
            .then((data) => {
                const formattedPosts = data.map((post, index) => ({
                    ...post,
                    title: englishAnnouncements[index]?.title || post.title,
                    body: englishAnnouncements[index]?.body || post.body
                }));
                setPosts(formattedPosts);
                setLoading(false);
            })
            .catch(() => {
                setError("Could not load announcements");
                setLoading(false);
            });
    }, []);

    return (

        <main className="home-page">


            {/* HERO SECTION */}

            <section className="hero-section">

                <h2 className="hero-side-label">
                    TECHFEST <span>2026</span>
                </h2>


                <div className="hero-content">

                    <p className="hero-eyebrow">
                        STUDENT TECHNOLOGY FESTIVAL
                    </p>


                    <h1>

                        Ideas don't stay
                        <span> ideas.</span>

                    </h1>


                    <p className="hero-description">

                        TechFest 2026 brings students together to
                        experiment, compete, collaborate and turn
                        ambitious ideas into real experiences.

                    </p>


                    <div className="hero-buttons">

                        <Link
                            to="/events"
                            className="primary-button"
                        >
                            Explore Events
                        </Link>


                        <Link
                            to="/register"
                            className="text-button"
                        >
                            Register Now
                            <span>→</span>
                        </Link>

                    </div>

                </div>


                <div className="hero-number">

                    26

                </div>

            </section>


            {/* INTRODUCTION */}

            <section className="intro-section">

                <div className="intro-label">

                    <span></span>

                    WHAT IS TECHFEST?

                </div>


                <div className="intro-content">

                    <h2>

                        More than an event.
                        <br />

                        <span>
                            A place to create.
                        </span>

                    </h2>


                    <div className="intro-text">

                        <p>

                            TechFest is built for students who want
                            to explore technology beyond the classroom.

                        </p>


                        <p>

                            From solving complex problems and building
                            robots to competing in gaming events and
                            learning emerging technologies, every
                            activity is designed around participation.

                        </p>

                    </div>

                </div>

            </section>


            {/* ACTIVITIES */}

            <section className="activities-section">

                <div className="activities-header">

                    <div>

                        <p className="section-label">

                            EXPLORE THE FESTIVAL

                        </p>


                        <h2>

                            Find your arena.

                        </h2>

                    </div>


                    <p>

                        Different interests.
                        Different challenges.
                        One shared space to experiment.

                    </p>

                </div>


                <div className="activities-grid">


                    <div className="activity-card">

                        <span className="activity-number">
                            01
                        </span>


                        <h3>
                            Hackathon
                        </h3>


                        <p>

                            Build solutions, solve problems and work
                            with ideas under pressure.

                        </p>

                    </div>


                    <div className="activity-card activity-card-offset">

                        <span className="activity-number">
                            02
                        </span>


                        <h3>
                            Robotics Challenge
                        </h3>


                        <p>

                            Design, experiment and test your ideas
                            through hands-on engineering challenges.

                        </p>

                    </div>


                    <div className="activity-card">

                        <span className="activity-number">
                            03
                        </span>


                        <h3>
                            Gaming Tournament
                        </h3>


                        <p>

                            Compete with other students in a focused
                            and high-energy gaming environment.

                        </p>

                    </div>


                    <div className="activity-card activity-card-offset">

                        <span className="activity-number">
                            04
                        </span>


                        <h3>
                            AI Workshop
                        </h3>


                        <p>

                            Explore artificial intelligence and learn
                            how modern technology is shaping the future.

                        </p>

                    </div>


                </div>

            </section>


            {/* ANNOUNCEMENTS */}

            <section className="announcements-section">

                <div className="section-heading">

                    <p className="section-label">
                        LATEST UPDATES
                    </p>

                    <h2>
                        Announcements
                    </h2>

                </div>


                {loading && (
                    <p className="loading-msg">Loading announcements...</p>
                )}

                {error && (
                    <p className="error-msg">{error}</p>
                )}

                {!loading && !error && (
                    <div className="api-events">

                        {posts.map((post) => (

                            <div className="event-card" key={post.id}>

                                <h3>{post.title}</h3>

                                <p>{post.body}</p>

                            </div>

                        ))}

                    </div>
                )}

            </section>


            {/* FINAL CTA */}

            <section className="home-cta">

                <div className="cta-number">
                    2026
                </div>


                <div className="cta-content">

                    <p>
                        READY TO PARTICIPATE?
                    </p>


                    <h2>

                        Bring your ideas.
                        <br />

                        We'll bring the challenge.

                    </h2>

                </div>


                <Link
                    to="/register"
                    className="cta-button"
                >
                    Join TechFest
                    <span>→</span>
                </Link>

            </section>


        </main>

    );

}

export default Home;