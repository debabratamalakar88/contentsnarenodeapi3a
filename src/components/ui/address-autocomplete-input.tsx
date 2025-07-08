
'use client'

import React, { useState, useEffect } from 'react'
import { Autocomplete, useJsApiLoader } from '@react-google-maps/api'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'

interface AddressAutocompleteInputProps {
  id: string
  name?: string
  placeholder?: string
  defaultValue?: string
}

const libraries: ('places')[] = ['places'];

export function AddressAutocompleteInput({ id, name, placeholder, defaultValue }: AddressAutocompleteInputProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries,
  })

  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const [address, setAddress] = useState(defaultValue || '');

  useEffect(() => {
    setAddress(defaultValue || '')
  }, [defaultValue])

  const onLoad = (ac: google.maps.places.Autocomplete) => {
    setAutocomplete(ac);
  };

  const onPlaceChanged = () => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();
      setAddress(place.formatted_address || '');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress(e.target.value);
  }

  if (loadError) {
    return <Input id={id} name={name} value="Error loading Google Maps" disabled />
  }

  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
      return <Input id={id} name={name} value="Google Maps API key is missing" placeholder="Address field disabled" disabled />
  }

  if (!isLoaded) {
    return <Skeleton className="h-10 w-full" />
  }

  return (
    <Autocomplete
      onLoad={onLoad}
      onPlaceChanged={onPlaceChanged}
      options={{
        types: ['address'],
      }}
    >
      <Input
        id={id}
        name={name}
        type="text"
        placeholder={placeholder || "Start typing an address..."}
        value={address}
        onChange={handleInputChange}
      />
    </Autocomplete>
  )
}
