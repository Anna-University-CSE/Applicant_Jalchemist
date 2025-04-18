import './JobCard.css';


const JobCard = ({ job }) => (
    <div className="job-card">
      <h3>{job.title}</h3>
      <p>{job.company}</p>
      <p>{job.location}</p>
      <button>View Details</button>
    </div>
  );
  
  export default JobCard;
  