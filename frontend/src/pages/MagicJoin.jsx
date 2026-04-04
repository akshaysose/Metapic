import React, { useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../AuthContext';

export default function MagicJoin() {
    const { code } = useParams();
    const { userToken } = useContext(AuthContext);
    const navigate = useNavigate();
    const API = import.meta.env.VITE_API || 'http://localhost:5000';

    useEffect(() => {
        const attemptJoin = async () => {
            if (!userToken) {
                // NOT LOGGED IN? 
                // Redirect to signup, but pass the 'from' state so AuthForm knows where to return
                navigate('/signup', { state: { from: `/join/${code}` } });
                return;
            }

            // LOGGED IN? Try to join immediately
            try {
                await axios.post(`${API}/api/client/join-group`, 
                    { code }, 
                    { headers: { Authorization: `Bearer ${userToken}` } }
                );
                // Success -> Go to Dashboard
                navigate('/dashboard'); 
            } catch (error) {
                // If error is "Already joined", that's fine, go to dashboard
                if (error.response?.status === 400) {
                    navigate('/dashboard');
                } else {
                    alert("Error joining group: " + error.response?.data?.message);
                    navigate('/'); // Fallback
                }
            }
        };

        attemptJoin();
    }, [code, userToken, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-teal-50">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-teal-800 mb-2">Joining Group...</h2>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-700 mx-auto"></div>
            </div>
        </div>
    );
}