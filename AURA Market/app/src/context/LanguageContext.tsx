import { createContext, useContext, useState, type ReactNode } from 'react';

export type Lang = 'en' | 'fr';

const translations = {
  en: {
    // Navbar
    home: 'Home',
    products: 'Products',
    cart: 'Cart',
    profile: 'Profile',
    dashboard: 'Dashboard',
    signIn: 'Sign in',
    signUp: 'Sign up',
    signOut: 'Sign out',
    // Profile page
    myProfile: 'My Profile',
    personalDetails: 'Personal Details',
    displayName: 'Display Name',
    email: 'Email',
    phone: 'Phone',
    address: 'Delivery Address',
    saveChanges: 'Save Changes',
    changePhoto: 'Change Photo',
    orderHistory: 'Order History',
    noOrders: 'No orders yet.',
    items: 'items',
    total: 'Total',
    status: 'Status',
    preferences: 'Preferences',
    language: 'Language',
    role: 'Role',
    uploading: 'Uploading…',
    saving: 'Saving…',
    profileUpdated: 'Profile updated!',
    photoUpdated: 'Photo updated!',
    errorSaving: 'Failed to save changes.',
    // Storefront
    shopByCategory: 'Shop by Category',
    viewAll: 'View All',
    featuredProducts: 'Featured Products',
    browseAll: 'Browse All',
    todaysDeals: "Today's Deals",
    seeAllDeals: 'See All Deals',
    addToCart: 'Add to Cart',
    outOfStock: 'Out of Stock',
    searchPlaceholder: 'Search products…',
  },
  fr: {
    // Navbar
    home: 'Accueil',
    products: 'Produits',
    cart: 'Panier',
    profile: 'Profil',
    dashboard: 'Tableau de bord',
    signIn: 'Se connecter',
    signUp: "S'inscrire",
    signOut: 'Déconnexion',
    // Profile page
    myProfile: 'Mon Profil',
    personalDetails: 'Détails personnels',
    displayName: 'Nom affiché',
    email: 'E-mail',
    phone: 'Téléphone',
    address: 'Adresse de livraison',
    saveChanges: 'Enregistrer',
    changePhoto: 'Changer la photo',
    orderHistory: 'Historique des commandes',
    noOrders: 'Aucune commande pour l\'instant.',
    items: 'articles',
    total: 'Total',
    status: 'Statut',
    preferences: 'Préférences',
    language: 'Langue',
    role: 'Rôle',
    uploading: 'Chargement…',
    saving: 'Enregistrement…',
    profileUpdated: 'Profil mis à jour !',
    photoUpdated: 'Photo mise à jour !',
    errorSaving: 'Échec de l\'enregistrement.',
    // Storefront
    shopByCategory: 'Parcourir par catégorie',
    viewAll: 'Voir tout',
    featuredProducts: 'Produits vedettes',
    browseAll: 'Parcourir tout',
    todaysDeals: 'Offres du jour',
    seeAllDeals: 'Voir toutes les offres',
    addToCart: 'Ajouter au panier',
    outOfStock: 'Rupture de stock',
    searchPlaceholder: 'Rechercher des produits…',
  },
};

export type TranslationKey = keyof typeof translations.en;

interface LangContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: TranslationKey) => string;
}

const LangContext = createContext<LangContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(
    () => (localStorage.getItem('aura_lang') as Lang) ?? 'en',
  );

  function setLang(l: Lang) {
    setLangState(l);
    localStorage.setItem('aura_lang', l);
  }

  const t = (key: TranslationKey): string => translations[lang][key] ?? key;

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLang must be used inside <LanguageProvider>');
  return ctx;
}
