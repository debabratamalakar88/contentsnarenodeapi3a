
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
  onValueChange?: (value: string) => void;
}

const libraries: ('places')[] = ['places'];

// Component with the hook, to be rendered conditionally by the main component.
function AddressAutocompleteWithApiKey(props: AddressAutocompleteInputProps & {apiKey: string}) {
    const { id, name, placeholder, defaultValue, apiKey, onValueChange } = props;

    const { isLoaded, loadError } = useJsApiLoader({
        googleMapsApiKey: apiKey,
        libraries,
    })

    const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
    const [address, setAddress] = useState(defaultValue || '');

    useEffect(() => {
        if (defaultValue !== address) {
            setAddress(defaultValue || '')
        }
    }, [defaultValue, address]);

    const onLoad = (ac: google.maps.places.Autocomplete) => {
        setAutocomplete(ac);
    };

    const onPlaceChanged = () => {
        if (autocomplete !== null) {
            const placeResult = autocomplete.getPlace();
            if (placeResult?.formatted_address) {
                const newAddress = placeResult.formatted_address;
                setAddress(newAddress);
                onValueChange?.(newAddress);
            }
        }
    };
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newAddress = e.target.value;
        setAddress(newAddress);
        onValueChange?.(newAddress);
    }

    if (loadError) {
        console.error("Error loading Google Maps API. Falling back to text input.", loadError);
        return (
            <Input
                id={id}
                name={name}
                type="text"
                placeholder={placeholder || "Enter an address..."}
                defaultValue={defaultValue}
                onChange={handleInputChange}
            />
        )
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

// Main exported component
export function AddressAutocompleteInput(props: AddressAutocompleteInputProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
      // If no API key, render a normal text input.
      return (
          <Input
              id={props.id}
              name={props.name}
              type="text"
              placeholder={props.placeholder || "Enter an address..."}
              defaultValue={props.defaultValue}
              onChange={(e) => props.onValueChange?.(e.target.value)}
          />
      );
  }

  // We have an API key, so we render the component that uses the hook.
  return <AddressAutocompleteWithApiKey {...props} apiKey={apiKey} />;
}
