import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { MagnifyingGlassIcon, PlusCircleIcon, AdjustmentsHorizontalIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import OpenMatCard from '../components/OpenMatCard';
import { getOpenMats } from '../services/api';
import { supabase } from '../services/api'; // Assurez-vous d'importer supabase
import { Typography } from '@mui/material'; // Supprimez 'Container' si inutilisé

const HomePage = () => {
    const [openMats, setOpenMats] = useState([]);
    const [filteredOpenMats, setFilteredOpenMats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        discipline: '',
        level: '',
        city: '',
        fromDate: '',
        toDate: ''
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [user, setUser] = useState(null);
    const openMatsPerPage = 6;

    useEffect(() => {
        const fetchOpenMats = async () => {
            try {
                setLoading(true);
                const data = await getOpenMats();
                setOpenMats(data);
                setFilteredOpenMats(data);
            } catch (err) {
                console.error('Erreur lors du chargement des Open Mats:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchOpenMats();
    }, []);

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { session }, } = await supabase.auth.getSession();
            if (session) {
                setUser(session.user);
            }
        };

        fetchUser();

        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_OUT') {
                setUser(null);
            } else if (event === 'SIGNED_IN') {
                setUser(session.user);
            }
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    const getUniqueOptions = (field) => {
        const options = [...new Set(openMats.map(item => item[field]))].filter(Boolean);
        return options.sort();
    };

    const applyFilters = useCallback(() => {
        let results = [...openMats];

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            results = results.filter(
                mat => mat.club_name.toLowerCase().includes(term) ||
                    mat.city.toLowerCase().includes(term) ||
                    mat.coach_name.toLowerCase().includes(term) ||
                    (mat.description && mat.description.toLowerCase().includes(term))
            );
        }

        if (filters.discipline) {
            results = results.filter(mat => mat.discipline === filters.discipline);
        }

        if (filters.level) {
            results = results.filter(mat => mat.level === filters.level);
        }

        if (filters.city) {
            results = results.filter(mat => mat.city === filters.city);
        }

        if (filters.fromDate) {
            results = results.filter(mat => new Date(mat.date) >= new Date(filters.fromDate));
        }

        if (filters.toDate) {
            results = results.filter(mat => new Date(mat.date) <= new Date(filters.toDate));
        }

        setFilteredOpenMats(results);
        setCurrentPage(1);
    }, [searchTerm, filters, openMats]);

    useEffect(() => {
        applyFilters();
    }, [searchTerm, filters, applyFilters]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const resetFilters = () => {
        setSearchTerm('');
        setFilters({
            discipline: '',
            level: '',
            city: '',
            fromDate: '',
            toDate: ''
        });
    };

    const indexOfLastOpenMat = currentPage * openMatsPerPage;
    const indexOfFirstOpenMat = indexOfLastOpenMat - openMatsPerPage;
    const currentOpenMats = filteredOpenMats.slice(indexOfFirstOpenMat, indexOfLastOpenMat);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className="min-h-screen bg-gray-100">
            <Helmet>
                <title>OpenMat France - Trouvez des Open Mats de Jiu-Jitsu Brésilien et Grappling</title>
                <meta name="description" content="Trouvez des Open Mats de Jiu-Jitsu Brésilien et Grappling partout en France. Rejoignez la communauté et participez à des événements près de chez vous." />
                <meta name="keywords" content="OpenMat, Jiu-Jitsu Brésilien, Grappling, France, Open Mats, événements sportifs" />
                <meta property="og:title" content="OpenMat France - Trouvez des Open Mats de Jiu-Jitsu Brésilien et Grappling" />
                <meta property="og:description" content="Trouvez des Open Mats de Jiu-Jitsu Brésilien et Grappling partout en France. Rejoignez la communauté et participez à des événements près de chez vous." />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://open-mat-france.vercel.app/" />
                <meta property="og:image" content="URL_DE_VOTRE_IMAGE" />
            </Helmet>

            <div className="bg-primary-700 bg-gradient-to-r from-blue-600 via-green-500 to-indigo-400 text-transparent bg-clip-text py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-3xl font-extrabold sm:text-4xl lg:text-5xl">
                            OpenMat France
                        </h1>
                        <p className="mt-3 max-w-md mx-auto text-lg sm:text-xl">
                            Trouvez des Open Mats de Jiu-Jitsu Brésilien et Grappling partout en France.
                        </p>
                        <br />
                        {user ? (
                            <Typography variant="body1" className="mt-4 text-black">
                                Bonjour, {user.email} !
                            </Typography>
                        ) : (
                            <Typography variant="body1" className="mt-4 text-black">
                                Vous n'êtes pas connecté. Veuillez vous connecter pour accéder à toutes les fonctionnalités.
                            </Typography>
                        )}
                        <div className="mt-8 flex justify-center text-black">
                            <Link
                                to="/add"
                                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-primary-700 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
                            >
                                <PlusCircleIcon className="h-5 w-5 mr-2 text-black" />
                                Ajouter un Open Mat
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
                    <div className="relative flex-1 max-w-md">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Rechercher par club, ville, coach..."
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        />
                    </div>

                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                        <AdjustmentsHorizontalIcon className="mr-2 h-5 w-5 text-gray-400" />
                        Filtres
                    </button>
                </div>

                {showFilters && (
                    <div className="mt-4 p-4 bg-white shadow rounded-lg">
                        <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-6">
                            <div className="sm:col-span-2">
                                <label htmlFor="discipline" className="block text-sm font-medium text-gray-700">
                                    Discipline
                                </label>
                                <select
                                    id="discipline"
                                    name="discipline"
                                    value={filters.discipline}
                                    onChange={handleFilterChange}
                                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                                >
                                    <option value="">Toutes les disciplines</option>
                                    {getUniqueOptions('discipline').map(option => (
                                        <option key={option} value={option}>{option}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="sm:col-span-2">
                                <label htmlFor="level" className="block text-sm font-medium text-gray-700">
                                    Niveau
                                </label>
                                <select
                                    id="level"
                                    name="level"
                                    value={filters.level}
                                    onChange={handleFilterChange}
                                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                                >
                                    <option value="">Tous les niveaux</option>
                                    {getUniqueOptions('level').map(option => (
                                        <option key={option} value={option}>{option}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="sm:col-span-2">
                                <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                                    Ville
                                </label>
                                <select
                                    id="city"
                                    name="city"
                                    value={filters.city}
                                    onChange={handleFilterChange}
                                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                                >
                                    <option value="">Toutes les villes</option>
                                    {getUniqueOptions('city').map(option => (
                                        <option key={option} value={option}>{option}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="sm:col-span-3">
                                <label htmlFor="fromDate" className="block text-sm font-medium text-gray-700">
                                    Date de début
                                </label>
                                <input
                                    type="date"
                                    id="fromDate"
                                    name="fromDate"
                                    value={filters.fromDate}
                                    onChange={handleFilterChange}
                                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                                />
                            </div>

                            <div className="sm:col-span-3">
                                <label htmlFor="toDate" className="block text-sm font-medium text-gray-700">
                                    Date de fin
                                </label>
                                <input
                                    type="date"
                                    id="toDate"
                                    name="toDate"
                                    value={filters.toDate}
                                    onChange={handleFilterChange}
                                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                                />
                            </div>
                        </div>

                        <div className="mt-4 flex justify-end">
                            <button
                                type="button"
                                onClick={resetFilters}
                                className="mr-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                            >
                                Réinitialiser
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowFilters(false)}
                                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                            >
                                Appliquer
                            </button>
                        </div>
                    </div>
                )}

                <div className="mt-8">
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                        </div>
                    ) : filteredOpenMats.length === 0 ? (
                        <div className="text-center py-12">
                            <h3 className="text-lg font-medium text-gray-900">Aucun Open Mat trouvé</h3>
                            <p className="mt-2 text-sm text-gray-500">
                                Aucun Open Mat ne correspond à vos critères de recherche. Essayez de modifier vos filtres ou d'ajouter un nouvel Open Mat.
                            </p>
                            <br />
                            <Link
                                to="/add"
                                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                            >
                                <PlusCircleIcon className="h-5 w-5 mr-2 text-black" />
                                <p className="text-black">
                                    Ajouter un Open Mat
                                </p>
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div className="mb-4 flex justify-between items-center">
                                <h2 className="text-lg font-medium text-gray-900">
                                    {filteredOpenMats.length} Open Mat{filteredOpenMats.length > 1 ? 's' : ''} trouvé{filteredOpenMats.length > 1 ? 's' : ''}
                                </h2>
                            </div>
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {currentOpenMats.map((openMat, index) => (
                                    <div
                                        key={openMat.id}
                                        className="opacity-0 animate-fade-up"
                                        style={{
                                            animationDelay: `${index * 100}ms`,
                                            animationFillMode: 'forwards'
                                        }}
                                    >
                                        <OpenMatCard openMat={openMat} />
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 flex justify-center">
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                    <button
                                        onClick={() => paginate(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                                    >
                                        <span className="sr-only">Previous</span>
                                        <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                                    </button>

                                    {Array.from({ length: Math.ceil(filteredOpenMats.length / openMatsPerPage) }, (_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => paginate(i + 1)}
                                            aria-current={currentPage === i + 1 ? 'page' : undefined}
                                            className={`${currentPage === i + 1
                                                ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                } relative inline-flex items-center px-4 py-2 border text-sm font-medium`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}

                                    <button
                                        onClick={() => paginate(currentPage + 1)}
                                        disabled={currentPage === Math.ceil(filteredOpenMats.length / openMatsPerPage)}
                                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                                    >
                                        <span className="sr-only">Next</span>
                                        <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                                    </button>
                                </nav>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HomePage;
