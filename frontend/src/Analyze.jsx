import React, { useState, useRef } from 'react';
import axios from 'axios';
import './App.css';
import './loader.css';

function Analyze() {

    const [image, setImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [analysis, setAnalysis] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const fileInputRef = useRef(null);
    const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000/analyze';

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreviewUrl(URL.createObjectURL(file));
            setAnalysis('');
            setError('');
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current.click();
    };

    const handleSubmit = async () => {
        if (!image) {
            setError('Please upload an image first.');
            return;
        }

        setIsLoading(true);
        setAnalysis('');
        setError('');

        const formData = new FormData();
        formData.append('image', image);

        try {
            const response = await axios.post(API_URL, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setAnalysis(response.data.analysis);
        } catch (err) {
            const errorMsg = err.response?.data?.error || 'An unknown error occurred.';
            setError(errorMsg);
            console.error('Analysis error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="App">
            <header>
                <h1>Derm-AI</h1>
            </header>
            <main>
                <input
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                />

                <div className="upload-section" onClick={triggerFileInput}>
                    <p>Click to upload an image</p>
                    <span>PNG, JPG, or WEBP</span>
                </div>

                {previewUrl && (
                    <div className="preview">
                        <img src={previewUrl} alt="Selected lesion" />
                    </div>
                )}

                <button
                    className="analyze-button"
                    onClick={handleSubmit}
                    disabled={!image || isLoading}
                >
                    {isLoading ? 'Analyzing...' : 'Run Educational Analysis'}
                </button>

                <div className="results-section">
                    {isLoading && (
                        <div className="loader-container">
                            <div className="loader"></div>
                        </div>
                    )}
                    {error && <div className="error-box">{error}</div>}
                    {analysis && (
                        <>
                            <h2>Analysis Results</h2>
                            <div className="analysis-box">{analysis}</div>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}

export default Analyze;
