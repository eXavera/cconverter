const delay = (miliseconds: number): Promise<void> => {
    return new Promise<void>(resolve => setTimeout(resolve, miliseconds))
}

export default delay