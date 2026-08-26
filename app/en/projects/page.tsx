import Link from "next/link";
import Footer from "@/components/Footer";

export default function ProjectsGrid() {
  return (
    <main>
      <h1>Projects</h1>
      <p>Explore our work and collaborations.</p>
      <section className="projects-grid">
        {/* Project cards will go here */}
        <article className="project-card">
          <h3>Project Name</h3>
          <p>Brief description</p>
          <Link href="/projects/example-slug">View Details →</Link>
        </article>
      </section>
      <Footer />
    </main>
  );
}
