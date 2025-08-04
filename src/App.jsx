import React, { useState } from 'react';

function App() {
  // State to hold the URL from the input field
  const [postUrl, setPostUrl] = useState('');
  // State to show feedback to the user
  const [statusMessage, setStatusMessage] = useState({ text: 'Bot is idle. Paste a URL to begin.', type: 'info' });
  // State to handle loading and disable the button
  const [isLoading, setIsLoading] = useState(false);

  // This function is called when the user clicks the button
  const handleLike = async (e) => {
    e.preventDefault();

    if (!postUrl) {
      setStatusMessage({ text: 'Please enter a URL.', type: 'error' });
      return;
    }

    setIsLoading(true);
    setStatusMessage({ text: 'Sending request to the bot...', type: 'info' });

    try {
      // The frontend calls our backend API endpoint.
      // In development, Vite's proxy will handle this.
      // In production, Netlify's redirect rule will handle this.
      const response = await fetch('/api/like-bot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ postUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        // If the server returns an error, display it
        throw new Error(data.error || 'An unknown error occurred.');
      }

      setStatusMessage({ text: data.message, type: 'success' });

    } catch (error) {
      console.error('Frontend Error:', error);
      setStatusMessage({ text: `Error: ${error.message}`, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper function to get the right color for the status message
  const getStatusColor = () => {
    switch (statusMessage.type) {
      case 'success':
        return 'text-green-500';
      case 'error':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center font-sans">
      <div className="w-full max-w-lg p-8 space-y-8 bg-white rounded-2xl shadow-lg">
        <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-800">SMM Liker Bot</h1>
            <p className="mt-2 text-gray-600">Powered by Vite, React & Netlify</p>
        </div>

        <form onSubmit={handleLike} className="space-y-6">
          <div>
            <label htmlFor="postUrl" className="text-sm font-medium text-gray-700">
              Post URL
            </label>
            <input
              id="postUrl"
              name="postUrl"
              type="url"
              required
              value={postUrl}
              onChange={(e) => setPostUrl(e.target.value)}
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="http://localhost:8888/test_page.html"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Liking...' : 'Like Post'}
            </button>
          </div>
        </form>

        <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className={`text-sm font-medium ${getStatusColor()}`}>
                {statusMessage.text}
            </p>
        </div>
      </div>
    </div>
  );
}

export default App;
