'use client';
import Image from "next/image";
import { useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';

/*
TASK 1:
Fetch a list of the first 10 people in the Star Wars API and display their names in a list. docs: https://swapi.dev/documentation#people
For the sake of this exercise, you do not use the built in pagination feature of the API.
TASK 2:
Add a + button next to each name that when clicked will fetch and display the person's homeworld. docs: https://swapi.dev/documentation#people
TASK 3:
Use react query to create a infinite paginated list of people from the Star Wars API. https://tanstack.com/query/latest/docs/framework/react/overview

*/

const fetchPeople = async ( { pageParam }: { pageParam?: number }): Promise<any> => {
  const response = await fetch(`https://swapi.dev/api/people?page=${Number(pageParam)}`);
  const data = await response.json();
  return data;
};
const fetchHomeworld = async (url: string) => {
  const res = await fetch(url);
  return res.json();
};
export default function Home() {


  const [homeworlds, setHomeworlds] = useState<{ [key: string]: string }>({});
  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['people'],
    queryFn: fetchPeople,
    getNextPageParam: (lastPage) => {
      const urlParams = new URLSearchParams(lastPage.next?.split('?')[1]);
      const currentPage = urlParams.get('page') ? Number(urlParams.get('page')) : 1;
      return currentPage + 1;
    },
    initialPageParam: 1

  });


  const handleFetchHomeworld = (url: string, name: string) => {
    fetchHomeworld(url).then((data) => {
      setHomeworlds((prev) => ({
        ...prev,
        [name]: data.name,
      }));
    });
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading data</div>;



  return (
    <div>
      <h1>Star Wars Characters</h1>
      <ul>
        {data?.pages[(data.pages.length) - 1]?.results?.slice(0, 10).map((person: any) => (
          <li key={person} style={{
            
            border: '1px solid grey',
            borderRadius: '10px',
            width: '350px',
            padding: '5px 10px',
            margin: '5px',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}>
            {person.name}{' '}
            {homeworlds[person.name] && <span>Homeworld: {homeworlds[person.name]}</span>}
            <button onClick={() => handleFetchHomeworld(person.homeworld, person.name)}>+</button>
          </li>
        ))}
      </ul>

      <div>
        {
          <button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            style={{
              backgroundColor: 'blue',
              cursor: 'pointer',
              marginLeft: 'auto',
              marginRight: 'auto',
              display: 'block',
              padding : '10px',
              borderRadius: '10px',
              color: 'white'
            }}
          >
            {isFetchingNextPage ? 'Loading more...' : 'Next'}
          </button>
        }
      </div>
    </div>

  );
};

