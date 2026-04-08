const About = () => {
  return (
    <section id="about" className="grid md:grid-cols-2">
      <div className="flex flex-col justify-center bg-foreground p-12 text-background md:p-20">
        <h2 className="mb-8 text-4xl font-bold uppercase tracking-tighter md:text-5xl">
          Почему
          <br />
          секонд-хенд?
        </h2>
        <ul className="space-y-4 text-background/80">
          <li className="flex items-start gap-4">
            <span className="mt-2 h-2 w-2 flex-shrink-0 bg-accent" />
            <span>Вещи, которых нет в масс-маркете</span>
          </li>
          <li className="flex items-start gap-4">
            <span className="mt-2 h-2 w-2 flex-shrink-0 bg-accent" />
            <span>Экологичнее — продлеваем жизнь одежде</span>
          </li>
          <li className="flex items-start gap-4">
            <span className="mt-2 h-2 w-2 flex-shrink-0 bg-accent" />
            <span>Известные бренды по доступной цене</span>
          </li>
          <li className="flex items-start gap-4">
            <span className="mt-2 h-2 w-2 flex-shrink-0 bg-accent" />
            <span>Проверенные продавцы и подлинность</span>
          </li>
        </ul>
      </div>

      <div
        id="sell"
        className="flex flex-col justify-center border-b border-border bg-background p-12 md:p-20"
      >
        <h2 className="mb-8 text-4xl font-bold uppercase tracking-tighter md:text-5xl">
          Продай
          <br />
          своё
        </h2>
        <p className="mb-8 max-w-md text-muted-foreground">
          Разгребите гардероб — заработайте на том, что не носите. Поможем быстро и выгодно продать вещи.
        </p>
        <a href="#" className="btn-brutal w-fit">
          Начать продажу
        </a>
      </div>
    </section>
  );
};

export default About;
