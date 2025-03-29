import React from 'react';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'Amadou Diallo',
    role: 'Entrepreneur',
    location: 'Bamako, Mali',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    content: 'Le processus d\'achat a été remarquablement fluide. L\'équipe d\'immo.africa m\'a accompagné à chaque étape, de la sélection de ma villa jusqu\'à la finalisation de l\'achat.',
    rating: 5
  },
  {
    id: 2,
    name: 'Fatou Sow',
    role: 'Médecin',
    location: 'Dakar, Sénégal',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
    content: 'J\'ai pu investir dans un terrain à Dakar en toute confiance grâce à immo.africa. La transparence du processus et la qualité du service client sont exceptionnelles.',
    rating: 5
  },
  {
    id: 3,
    name: 'Kouamé Koffi',
    role: 'Ingénieur',
    location: 'Abidjan, Côte d\'Ivoire',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
    content: 'La plateforme offre une excellente visibilité sur le marché immobilier ouest-africain. Les outils de financement proposés m\'ont permis de concrétiser mon projet sereinement.',
    rating: 5
  }
];

export function Testimonials() {
  return (
    <section className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Ce que disent nos clients
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Découvrez les expériences de nos clients qui ont fait confiance à immo.africa
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-gray-50 rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center space-x-2 mb-6">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>

              <Quote className="h-8 w-8 text-blue-600 mb-4" />

              <p className="text-gray-600 mb-6">
                "{testimonial.content}"
              </p>

              <div className="flex items-center">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="h-12 w-12 rounded-full object-cover"
                />
                <div className="ml-4">
                  <h4 className="text-lg font-semibold text-gray-900">
                    {testimonial.name}
                  </h4>
                  <div className="text-sm text-gray-600">
                    {testimonial.role} • {testimonial.location}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm">
            <Star className="h-4 w-4 fill-current" />
            <span>Note moyenne de 4.9/5 basée sur plus de 200 avis clients</span>
          </div>
        </div>
      </div>
    </section>
  );
}