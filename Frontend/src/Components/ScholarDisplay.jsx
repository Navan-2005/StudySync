import React from 'react';

const ScholarDisplay = ({ data }) => {
  if (!data || !data.scholars) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500 text-lg">Loading scholar data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">Scholar Publications</h1>
      
      <div className="space-y-6">
        {data.scholars.map((scholar) => (
          <div 
            key={scholar.result_id} 
            className="bg-white rounded-lg shadow-md p-6 relative hover:shadow-lg transition-shadow duration-300"
          >
            {/* Position badge */}
            <div className="absolute -top-3 -left-3 bg-blue-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-md">
              #{scholar.position}
            </div>
            
            {/* Title */}
            <h2 className="text-xl font-semibold text-blue-600 mb-2">
              <a 
                href={scholar.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:underline"
              >
                {scholar.title}
              </a>
            </h2>
            
            {/* Publication type */}
            {scholar.type && (
              <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded mb-3">
                {scholar.type}
              </span>
            )}
            
            {/* Snippet */}
            <p className="text-gray-600 mb-4">{scholar.snippet}</p>
            
            {/* Publication info */}
            {scholar.publication_info && (
              <div className="bg-gray-50 p-3 rounded-md mb-4">
                <p className="text-sm text-gray-700">{scholar.publication_info.summary}</p>
                
                {/* Authors */}
                {scholar.publication_info.authors && scholar.publication_info.authors.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-medium text-gray-700">Authors:</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {scholar.publication_info.authors.map((author) => (
                        <a
                          key={author.author_id}
                          href={author.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100"
                        >
                          {author.name}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Resources */}
            {scholar.resources && scholar.resources.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-1">Resources:</p>
                <ul className="space-y-1">
                  {scholar.resources.map((resource, index) => (
                    <li key={index}>
                      <a
                        href={resource.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-green-600 hover:underline"
                      >
                        {resource.title} ({resource.file_format})
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Inline links */}
            {scholar.inline_links && (
              <div className="flex flex-wrap gap-4 pt-3 border-t border-gray-200 text-sm">
                {scholar.inline_links.cited_by && (
                  <div className="flex items-center">
                    <span className="font-medium text-gray-700 mr-1">Cited by:</span>
                    <a
                      href={scholar.inline_links.cited_by.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-red-500 hover:underline"
                    >
                      {scholar.inline_links.cited_by.total.toLocaleString()} citations
                    </a>
                  </div>
                )}
                
                {scholar.inline_links.versions && (
                  <div className="flex items-center">
                    <span className="font-medium text-gray-700 mr-1">Versions:</span>
                    <a
                      href={scholar.inline_links.versions.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-red-500 hover:underline"
                    >
                      {scholar.inline_links.versions.total} versions
                    </a>
                  </div>
                )}
                
                {scholar.inline_links.cached_page_link && (
                  <a
                    href={scholar.inline_links.cached_page_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-red-500 hover:underline"
                  >
                    View cached version
                  </a>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScholarDisplay;