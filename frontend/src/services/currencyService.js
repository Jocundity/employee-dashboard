export async function getExchangeRate(fromCurrency, toCurrency, amount) {
    const EXCHANGE_RATE_API_URL = `https://api.frankfurter.dev/v2/rates?base=${fromCurrency}&quotes=${toCurrency}`;

    const response = await fetch(EXCHANGE_RATE_API_URL);
    const data = await response.json();

    const exchangeRate = data[0].rate;
    const conversion = amount * exchangeRate;

    return {
        amount: amount,
        fromCurrency: fromCurrency,
        toCurrency: toCurrency,
        exchangeRate: exchangeRate,
        result: conversion.toFixed(2)
    }

}