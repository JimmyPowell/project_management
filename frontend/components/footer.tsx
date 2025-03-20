export function Footer() {
  const currentYear = new Date().getFullYear()
  
  return (
    <footer className="border-t py-6">
      <div className="container flex flex-col items-center justify-center gap-2 text-center">
        <p className="text-sm leading-loose text-muted-foreground">
          &copy; {currentYear} 泠启科技. 保留所有权利.
        </p>
        <p className="text-sm leading-loose text-muted-foreground">
          <a 
            href="https://lingnite.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="font-medium underline underline-offset-4 hover:text-primary"
          >
            lingnite.com
          </a>
        </p>
      </div>
    </footer>
  )
} 