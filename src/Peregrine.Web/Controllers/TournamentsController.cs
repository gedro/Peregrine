﻿using System;
using System.Linq;
using System.Web.Http;
using Peregrine.Data;

namespace Peregrine.Web.Controllers
{
	[RoutePrefix("api/tournaments")]
	public class TournamentsController : ApiController
	{
		[Route]
		public IHttpActionResult Get()
		{
			using(var dataContext = new DataContext())
			{
				var tournamentKeys = dataContext
					.Tournaments
					.Select(tournament => tournament.Key)
					.ToArray();

				return Ok(tournamentKeys);
			}
		}

		[Route]
		public IHttpActionResult Post()
		{
			using(var dataContext = new DataContext())
			{
				var tournament = dataContext
					.Tournaments
					.Add(new Tournament
					{
						Key = Guid.NewGuid(),
					});

				dataContext.SaveChanges();

				return CreatedAtRoute(
					"tournament-get",
					new { tournamentKey = tournament.Key },
					new
					{
						key = tournament.Key,
					});
			}
		}
	}
}