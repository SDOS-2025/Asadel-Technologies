import "./LogReports.css"

const LogReports = () => {
  const mockData = [
    {
      region: "Building A",
      subRegion: "Entry 1",
      cameraName: "Entry 1",
      alertType: "Smoke",
      description: "C1",
      timeStamp: "12:07:44",
      dateCreated: "15/02/25",
    },
    {
      region: "Building A",
      subRegion: "Entry 1",
      cameraName: "Entry 1",
      alertType: "Smoke",
      description: "C1",
      timeStamp: "12:07:44",
      dateCreated: "15/02/25",
    },
    {
      region: "Building A",
      subRegion: "Entry 1",
      cameraName: "Entry 1",
      alertType: "Smoke",
      description: "C1",
      timeStamp: "12:07:44",
      dateCreated: "15/02/25",
    },
  ]

  return (
    <div className="log-reports">
      {/* Header */}

      {/* Filters */}
      <div className="container-fluid mt-3">
        <div className="row g-3">
          {/* Camera Filter */}
          <div className="col-md-4">
            <div className="filter-card">
              <h6 className="filter-title">
                <i className="bi bi-camera"></i> Camera
              </h6>
              <select className="form-select mb-2">
                <option>Region</option>
                <option>Building A</option>
              </select>
              <select className="form-select mb-2">
                <option>Sub-region</option>
                <option>Entry 1</option>
              </select>
              <select className="form-select">
                <option>Camera</option>
                <option>Entry 1</option>
              </select>
            </div>
          </div>

          {/* Alert Filter */}
          <div className="col-md-4">
            <div className="filter-card">
              <h6 className="filter-title">
                <i className="bi bi-bell"></i> Alert
              </h6>
              <select className="form-select">
                <option>Alert Type</option>
                <option>Smoke</option>
              </select>
            </div>
          </div>

          {/* Time Filter */}
          <div className="col-md-4">
            <div className="filter-card">
              <h6 className="filter-title">
                <i className="bi bi-clock"></i> Time
              </h6>
              <select className="form-select">
                <option>DATE</option>
                <option>Today</option>
              </select>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="d-flex justify-content-end mt-3 gap-2">
          <button className="btn btn-secondary">View PDF</button>
          <button className="btn btn-primary">Download Report</button>
        </div>

        {/* Table */}
        <div className="table-responsive mt-3">
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>Region</th>
                <th>Sub-region</th>
                <th>Camera Name</th>
                <th>Alert Type</th>
                <th>Description</th>
                <th>Time Stamp</th>
                <th>Date Created</th>
                <th>Snapshot</th>
              </tr>
            </thead>
            <tbody>
              {mockData.map((row, index) => (
                <tr key={index}>
                  <td>{row.region}</td>
                  <td>{row.subRegion}</td>
                  <td>{row.cameraName}</td>
                  <td>{row.alertType}</td>
                  <td>{row.description}</td>
                  <td>{row.timeStamp}</td>
                  <td>{row.dateCreated}</td>
                  <td>
                    <div className="snapshot-placeholder">
                      <i className="bi bi-image"></i>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="d-flex justify-content-center mt-3">
          <nav>
            <ul className="pagination">
              <li className="page-item">
                <a className="page-link" href="#" aria-label="Previous">
                  <span aria-hidden="true">&laquo;</span>
                </a>
              </li>
              <li className="page-item">
                <a className="page-link" href="#">
                  1
                </a>
              </li>
              <li className="page-item">
                <a className="page-link" href="#">
                  2
                </a>
              </li>
              <li className="page-item">
                <a className="page-link" href="#">
                  3
                </a>
              </li>
              <li className="page-item">
                <a className="page-link" href="#">
                  4
                </a>
              </li>
              <li className="page-item">
                <a className="page-link" href="#" aria-label="Next">
                  <span aria-hidden="true">&raquo;</span>
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Footer */}
   
    </div>
  )
}

export default LogReports;
