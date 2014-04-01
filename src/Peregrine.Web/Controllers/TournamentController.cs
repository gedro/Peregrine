﻿using System;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using Peregrine.Data;
using Peregrine.Web.Models;
using Peregrine.Web.Services;

namespace Peregrine.Web.Controllers
{
	[RoutePrefix("api/tournaments/{tournamentKey}")]
	public class TournamentController : ApiController
	{
		readonly EventPublisher EventPublisher;
		readonly TournamentResponseProvider TournamentResponseProvider;

		public TournamentController(EventPublisher eventPublisher, TournamentResponseProvider tournamentResponseProvider)
		{
			if(eventPublisher == null)
				throw new ArgumentNullException("eventPublisher");

			if(tournamentResponseProvider == null)
				throw new ArgumentNullException("tournamentResponseProvider");

			EventPublisher = eventPublisher;
			TournamentResponseProvider = tournamentResponseProvider;
		}

		[Route(Name = "tournament-get")]
		public IHttpActionResult Get(Guid tournamentKey)
		{
			using(var dataContext = new DataContext())
			{
				var tournament = dataContext.GetTournament(tournamentKey);

				if(tournament == null)
					return NotFound();

				return Ok(TournamentResponseProvider.Create(tournament));
			}
		}

		[Route("updates")]
		public IHttpActionResult GetEventSource(Guid tournamentKey)
		{
			return ResponseMessage(new HttpResponseMessage
			{
				Content = new PushStreamContent(
					(stream, content, context) => EventStreamManager
						.GetInstance("tournament", tournamentKey.ToString())
						.AddListener(new System.IO.StreamWriter(stream)),
					"text/event-stream"
				),
			});
		}

		[Route]
		public IHttpActionResult Put(Guid tournamentKey, [FromBody] TournamentRequest requestBody)
		{
			if(requestBody == null)
				return BadRequest("No request body provided.");

			using(var dataContext = new DataContext())
			{
				var tournament = dataContext.GetTournament(tournamentKey);

				if(tournament == null)
					return NotFound();

				tournament.Name = requestBody.name;
				
				dataContext.SaveChanges();

				EventPublisher.Created(tournament);

				return Ok(TournamentResponseProvider.Create(tournament));
			}
		}

		[Route]
		public IHttpActionResult Delete(Guid tournamentKey)
		{
			using(var dataContext = new DataContext())
			{
				var tournament = dataContext.GetTournament(tournamentKey);

				if(tournament == null)
					return NotFound();

				EventPublisher.Deleted(tournament);

				return StatusCode(HttpStatusCode.NoContent);
			}
		}
	}
}
